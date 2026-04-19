import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const EMPTY = { matricula: '', marca: '', modelo: '', anio: '', color: '', conductor: '', telefono_conductor: '', notas: '' }

export default function Flota() {
  const [vehiculos, setVehiculos] = useState([])
  const [seguros, setSeguros] = useState([])
  const [itv, setItv] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [v, s, i] = await Promise.all([
      supabase.from('vehiculos').select('*').eq('activo', true).order('matricula'),
      supabase.from('seguros').select('vehiculo_id, fecha_vencimiento').order('fecha_vencimiento', { ascending: false }),
      supabase.from('itv').select('vehiculo_id, fecha_vencimiento').order('fecha_vencimiento', { ascending: false }),
    ])
    setVehiculos(v.data || [])
    setSeguros(s.data || [])
    setItv(i.data || [])
    setLoading(false)
  }

  function getLatest(arr, vid) {
    return arr.filter(x => x.vehiculo_id === vid)[0]?.fecha_vencimiento
  }

  function estadoFecha(fecha) {
    if (!fecha) return { label: 'Sin datos', cls: 'tag-gray' }
    const d = new Date(fecha)
    const dias = Math.ceil((d - new Date()) / 86400000)
    if (dias < 0) return { label: 'Vencido', cls: 'tag-red' }
    if (dias <= 30) return { label: `${dias}d`, cls: 'tag-red' }
    if (dias <= 60) return { label: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }), cls: 'tag-amber' }
    return { label: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' }), cls: 'tag-green' }
  }

  function openNew() { setForm(EMPTY); setModal('new') }
  function openEdit(v) { setForm({ ...v, anio: v.anio || '' }); setModal('edit') }

  async function save() {
    if (!form.matricula || !form.marca || !form.modelo) return toast.error('Matrícula, marca y modelo son obligatorios')
    setSaving(true)
    const data = { ...form, anio: form.anio ? parseInt(form.anio) : null }
    const { error } = modal === 'new'
      ? await supabase.from('vehiculos').insert(data)
      : await supabase.from('vehiculos').update(data).eq('id', form.id)
    setSaving(false)
    if (error) return toast.error('Error al guardar: ' + error.message)
    toast.success(modal === 'new' ? 'Vehículo añadido' : 'Vehículo actualizado')
    setModal(null)
    loadAll()
  }

  async function remove(id) {
    if (!confirm('¿Eliminar este vehículo y todos sus datos?')) return
    await supabase.from('vehiculos').update({ activo: false }).eq('id', id)
    toast.success('Vehículo eliminado')
    loadAll()
  }

  const filtered = vehiculos.filter(v =>
    v.matricula.toLowerCase().includes(search.toLowerCase()) ||
    v.marca.toLowerCase().includes(search.toLowerCase()) ||
    (v.conductor || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="search-input" placeholder="Buscar matrícula, marca..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={openNew}>+ Añadir vehículo</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div className="loading">Cargando flota...</div> : (
            <table>
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Marca / Modelo</th>
                  <th className="hide-mobile">Conductor</th>
                  <th>Seguro</th>
                  <th>ITV</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="empty">Sin vehículos registrados</td></tr>
                ) : filtered.map(v => {
                  const seg = estadoFecha(getLatest(seguros, v.id))
                  const itvD = estadoFecha(getLatest(itv, v.id))
                  return (
                    <tr key={v.id}>
                      <td><span className="plate">{v.matricula}</span></td>
                      <td>{v.marca} {v.modelo} {v.anio ? <span style={{ color: 'var(--text3)', fontSize: 11 }}>({v.anio})</span> : ''}</td>
                      <td className="hide-mobile" style={{ color: v.conductor ? 'var(--text)' : 'var(--text3)' }}>{v.conductor || '—'}</td>
                      <td><span className={`tag ${seg.cls}`}>{seg.label}</span></td>
                      <td><span className={`tag ${itvD.cls}`}>{itvD.label}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => openEdit(v)}>Editar</button>
                          <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => remove(v.id)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{modal === 'new' ? 'Nuevo vehículo' : 'Editar vehículo'}</span>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Matrícula *</label>
                  <input className="form-input" placeholder="1234 ABC" value={form.matricula} onChange={e => setForm(f => ({ ...f, matricula: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input className="form-input" placeholder="Blanco" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Marca *</label>
                  <input className="form-input" placeholder="Ford" value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Modelo *</label>
                  <input className="form-input" placeholder="Transit" value={form.modelo} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Año</label>
                  <input className="form-input" type="number" placeholder="2022" value={form.anio} onChange={e => setForm(f => ({ ...f, anio: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Conductor</label>
                  <input className="form-input" placeholder="Nombre" value={form.conductor} onChange={e => setForm(f => ({ ...f, conductor: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono del conductor</label>
                <input className="form-input" placeholder="+34 600 000 000" value={form.telefono_conductor} onChange={e => setForm(f => ({ ...f, telefono_conductor: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Notas</label>
                <textarea className="form-textarea" placeholder="Observaciones..." value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
