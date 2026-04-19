import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const EMPTY = { vehiculo_id: '', concepto: '', categoria: 'revision', importe: '', fecha: new Date().toISOString().split('T')[0], proveedor: '', notas: '' }

const CATEGORIAS = {
  seguro: { label: 'Seguro', cls: 'tag-blue' },
  itv: { label: 'ITV', cls: 'tag-gray' },
  averia: { label: 'Avería', cls: 'tag-red' },
  revision: { label: 'Revisión', cls: 'tag-blue' },
  combustible: { label: 'Combustible', cls: 'tag-amber' },
  multa: { label: 'Multa', cls: 'tag-red' },
  otro: { label: 'Otro', cls: 'tag-gray' },
}

export default function Gastos() {
  const [gastos, setGastos] = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroVeh, setFiltroVeh] = useState('')
  const [filtroCat, setFiltroCat] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [g, v] = await Promise.all([
      supabase.from('gastos').select('*, vehiculos(matricula, marca, modelo)').order('fecha', { ascending: false }),
      supabase.from('vehiculos').select('id, matricula, marca, modelo').eq('activo', true).order('matricula'),
    ])
    setGastos(g.data || [])
    setVehiculos(v.data || [])
    setLoading(false)
  }

  async function save() {
    if (!form.vehiculo_id || !form.concepto || !form.importe) return toast.error('Vehículo, concepto e importe son obligatorios')
    setSaving(true)
    const data = { ...form, importe: parseFloat(form.importe) }
    const { error } = form.id
      ? await supabase.from('gastos').update(data).eq('id', form.id)
      : await supabase.from('gastos').insert(data)
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success(form.id ? 'Gasto actualizado' : 'Gasto registrado')
    setModal(false)
    loadAll()
  }

  async function remove(id) {
    if (!confirm('¿Eliminar este gasto?')) return
    await supabase.from('gastos').delete().eq('id', id)
    toast.success('Gasto eliminado')
    loadAll()
  }

  const filtered = gastos.filter(g => {
    const matchVeh = !filtroVeh || g.vehiculo_id === filtroVeh
    const matchCat = !filtroCat || g.categoria === filtroCat
    return matchVeh && matchCat
  })

  const totalFiltrado = filtered.reduce((acc, g) => acc + (g.importe || 0), 0)

  const ahora = new Date()
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  const gastoMes = gastos.filter(g => new Date(g.fecha) >= inicioMes).reduce((acc, g) => acc + (g.importe || 0), 0)
  const gastoTotal = gastos.reduce((acc, g) => acc + (g.importe || 0), 0)

  return (
    <>
      <div className="metrics" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
        <div className="metric">
          <div className="metric-label">Total registrado</div>
          <div className="metric-value" style={{ fontSize: 20 }}>{gastoTotal.toLocaleString('es-ES', { minimumFractionDigits: 0 })}€</div>
        </div>
        <div className="metric metric-amber">
          <div className="metric-label">Este mes</div>
          <div className="metric-value" style={{ fontSize: 20 }}>{gastoMes.toLocaleString('es-ES', { minimumFractionDigits: 0 })}€</div>
        </div>
        <div className="metric">
          <div className="metric-label">Resultado filtrado</div>
          <div className="metric-value" style={{ fontSize: 20 }}>{totalFiltrado.toLocaleString('es-ES', { minimumFractionDigits: 0 })}€</div>
          <div className="metric-sub">{filtered.length} registros</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="form-select" style={{ width: 'auto', fontSize: 12 }} value={filtroVeh} onChange={e => setFiltroVeh(e.target.value)}>
          <option value="">Todos los vehículos</option>
          {vehiculos.map(v => <option key={v.id} value={v.id}>{v.matricula} — {v.marca}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto', fontSize: 12 }} value={filtroCat} onChange={e => setFiltroCat(e.target.value)}>
          <option value="">Todas las categorías</option>
          {Object.entries(CATEGORIAS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => { setForm(EMPTY); setModal(true) }}>+ Añadir gasto</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div className="loading">Cargando gastos...</div> : (
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Vehículo</th>
                  <th>Concepto</th>
                  <th>Categoría</th>
                  <th className="hide-mobile">Proveedor</th>
                  <th style={{ textAlign: 'right' }}>Importe</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="empty">Sin gastos registrados</td></tr>
                ) : filtered.map(g => {
                  const cat = CATEGORIAS[g.categoria] || { label: g.categoria, cls: 'tag-gray' }
                  return (
                    <tr key={g.id}>
                      <td style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{new Date(g.fecha).toLocaleDateString('es-ES')}</td>
                      <td><span className="plate">{g.vehiculos?.matricula}</span></td>
                      <td style={{ fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.concepto}</td>
                      <td><span className={`tag ${cat.cls}`}>{cat.label}</span></td>
                      <td className="hide-mobile" style={{ fontSize: 12, color: 'var(--text2)' }}>{g.proveedor || '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{parseFloat(g.importe).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => { setForm({ ...g, importe: g.importe || '' }); setModal(true) }}>Editar</button>
                          <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => remove(g.id)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={5} style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Total</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, fontSize: 14 }}>{totalFiltrado.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{form.id ? 'Editar gasto' : 'Nuevo gasto'}</span>
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
              <div className="form-group">
                <label className="form-label">Concepto *</label>
                <input className="form-input" placeholder="Describe el gasto" value={form.concepto} onChange={e => setForm(f => ({ ...f, concepto: e.target.value }))} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select className="form-select" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                    {Object.entries(CATEGORIAS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Importe (€) *</label>
                  <input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.importe} onChange={e => setForm(f => ({ ...f, importe: e.target.value }))} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input className="form-input" type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Proveedor / Taller</label>
                  <input className="form-input" placeholder="Nombre del proveedor" value={form.proveedor} onChange={e => setForm(f => ({ ...f, proveedor: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notas</label>
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
