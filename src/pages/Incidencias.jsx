import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const EMPTY = { vehiculo_id: '', tipo: 'golpe', descripcion: '', fecha: new Date().toISOString().split('T')[0], estado: 'abierta', taller_id: '', coste_estimado: '', coste_final: '', notas: '' }

export default function Incidencias() {
  const [incidencias, setIncidencias] = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [talleres, setTalleres] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [inc, v, t] = await Promise.all([
      supabase.from('incidencias').select('*, vehiculos(matricula, marca, modelo), talleres(nombre)').order('fecha', { ascending: false }),
      supabase.from('vehiculos').select('id, matricula, marca, modelo').eq('activo', true).order('matricula'),
      supabase.from('talleres').select('id, nombre').order('nombre'),
    ])
    setIncidencias(inc.data || [])
    setVehiculos(v.data || [])
    setTalleres(t.data || [])
    setLoading(false)
  }

  function openNew() { setForm(EMPTY); setModal(true) }
  function openEdit(inc) {
    setForm({
      ...inc,
      taller_id: inc.taller_id || '',
      coste_estimado: inc.coste_estimado || '',
      coste_final: inc.coste_final || '',
    })
    setModal(true)
  }

  async function save() {
    if (!form.vehiculo_id || !form.descripcion) return toast.error('Vehículo y descripción son obligatorios')
    setSaving(true)
    const data = {
      ...form,
      taller_id: form.taller_id || null,
      coste_estimado: form.coste_estimado ? parseFloat(form.coste_estimado) : null,
      coste_final: form.coste_final ? parseFloat(form.coste_final) : null,
    }
    const { error } = form.id
      ? await supabase.from('incidencias').update(data).eq('id', form.id)
      : await supabase.from('incidencias').insert(data)
    setSaving(false)
    if (error) return toast.error(error.message)

    // Si hay coste final, registrar automáticamente en gastos
    if (!form.id && form.coste_final) {
      await supabase.from('gastos').insert({
        vehiculo_id: form.vehiculo_id,
        concepto: form.descripcion,
        categoria: form.tipo === 'revision' ? 'revision' : 'averia',
        importe: parseFloat(form.coste_final),
        fecha: form.fecha,
      })
    }

    toast.success(form.id ? 'Incidencia actualizada' : 'Incidencia registrada')
    setModal(false)
    loadAll()
  }

  async function remove(id) {
    if (!confirm('¿Eliminar esta incidencia?')) return
    await supabase.from('incidencias').delete().eq('id', id)
    toast.success('Incidencia eliminada')
    loadAll()
  }

  const tipoMap = { golpe: 'Golpe', averia: 'Avería', revision: 'Revisión', otro: 'Otro' }
  const estadoMap = { abierta: 'Abierta', en_taller: 'En taller', resuelta: 'Resuelta' }
  const tipoCls = { golpe: 'tag-amber', averia: 'tag-red', revision: 'tag-blue', otro: 'tag-gray' }
  const estadoCls = { abierta: 'warn', en_taller: 'warn', resuelta: 'ok' }

  const filtered = incidencias.filter(i => {
    const matchSearch = !search ||
      i.vehiculos?.matricula?.toLowerCase().includes(search.toLowerCase()) ||
      i.descripcion?.toLowerCase().includes(search.toLowerCase())
    const matchTipo = filtroTipo === 'todos' || i.tipo === filtroTipo
    const matchEstado = filtroEstado === 'todos' || i.estado === filtroEstado
    return matchSearch && matchTipo && matchEstado
  })

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="search-input" placeholder="Buscar matrícula..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" style={{ width: 'auto', fontSize: 12 }} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="todos">Todos los tipos</option>
          <option value="golpe">Golpes</option>
          <option value="averia">Averías</option>
          <option value="revision">Revisiones</option>
          <option value="otro">Otros</option>
        </select>
        <select className="form-select" style={{ width: 'auto', fontSize: 12 }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="todos">Todos los estados</option>
          <option value="abierta">Abiertas</option>
          <option value="en_taller">En taller</option>
          <option value="resuelta">Resueltas</option>
        </select>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={openNew}>+ Nueva incidencia</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div className="loading">Cargando...</div> : (
            <table>
              <thead>
                <tr>
                  <th>Vehículo</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th className="hide-mobile">Fecha</th>
                  <th className="hide-mobile">Taller</th>
                  <th>Coste</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="empty">Sin incidencias registradas</td></tr>
                ) : filtered.map(i => (
                  <tr key={i.id}>
                    <td><span className="plate">{i.vehiculos?.matricula}</span></td>
                    <td><span className={`tag ${tipoCls[i.tipo] || 'tag-gray'}`}>{tipoMap[i.tipo] || i.tipo}</span></td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>{i.descripcion}</td>
                    <td className="hide-mobile" style={{ fontSize: 12, color: 'var(--text2)' }}>{new Date(i.fecha).toLocaleDateString('es-ES')}</td>
                    <td className="hide-mobile" style={{ fontSize: 12, color: 'var(--text2)' }}>{i.talleres?.nombre || '—'}</td>
                    <td style={{ fontSize: 12 }}>
                      {i.coste_final ? <strong>{parseFloat(i.coste_final).toLocaleString('es-ES')}€</strong> : i.coste_estimado ? <span style={{ color: 'var(--text3)' }}>~{parseFloat(i.coste_estimado).toLocaleString('es-ES')}€</span> : '—'}
                    </td>
                    <td><span className={estadoCls[i.estado] || ''}>{estadoMap[i.estado] || i.estado}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => openEdit(i)}>Editar</button>
                        <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => remove(i.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{form.id ? 'Editar incidencia' : 'Nueva incidencia'}</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Vehículo *</label>
                <select className="form-select" value={form.vehiculo_id} onChange={e => setForm(f => ({ ...f, vehiculo_id: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {vehiculos.map(v => <option key={v.id} value={v.id}>{v.matricula} — {v.marca} {v.modelo}</option>)}
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tipo *</label>
                  <select className="form-select" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                    <option value="golpe">Golpe</option>
                    <option value="averia">Avería</option>
                    <option value="revision">Revisión</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input className="form-input" type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Descripción *</label>
                <textarea className="form-textarea" placeholder="Describe la incidencia con detalle..." value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Taller asignado</label>
                  <select className="form-select" value={form.taller_id} onChange={e => setForm(f => ({ ...f, taller_id: e.target.value }))}>
                    <option value="">Sin asignar</option>
                    {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-select" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                    <option value="abierta">Abierta</option>
                    <option value="en_taller">En taller</option>
                    <option value="resuelta">Resuelta</option>
                  </select>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Coste estimado (€)</label>
                  <input className="form-input" type="number" placeholder="0" value={form.coste_estimado} onChange={e => setForm(f => ({ ...f, coste_estimado: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Coste final (€)</label>
                  <input className="form-input" type="number" placeholder="0" value={form.coste_final} onChange={e => setForm(f => ({ ...f, coste_final: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notas internas</label>
                <textarea className="form-textarea" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
