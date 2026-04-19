import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { differenceInDays } from 'date-fns'
import toast from 'react-hot-toast'

const EMPTY_SEG = { vehiculo_id: '', compania: '', numero_poliza: '', fecha_inicio: '', fecha_vencimiento: '', tipo: 'terceros', coste: '', notas: '' }
const EMPTY_ITV = { vehiculo_id: '', fecha_realizacion: '', fecha_vencimiento: '', resultado: 'favorable', estacion: '', coste: '', notas: '' }

export default function Alertas() {
  const [seguros, setSeguros] = useState([])
  const [itvs, setItvs] = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [modal, setModal] = useState(null)
  const [formSeg, setFormSeg] = useState(EMPTY_SEG)
  const [formItv, setFormItv] = useState(EMPTY_ITV)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [v, s, i] = await Promise.all([
      supabase.from('vehiculos').select('id, matricula, marca, modelo, conductor').eq('activo', true).order('matricula'),
      supabase.from('seguros').select('*, vehiculos(matricula, marca, modelo)').order('fecha_vencimiento'),
      supabase.from('itv').select('*, vehiculos(matricula, marca, modelo)').order('fecha_vencimiento'),
    ])
    setVehiculos(v.data || [])
    setSeguros(s.data || [])
    setItvs(i.data || [])
    setLoading(false)
  }

  function diasRestantes(fecha) {
    return differenceInDays(new Date(fecha), new Date())
  }

  function estadoAlerta(fecha) {
    const dias = diasRestantes(fecha)
    if (dias < 0) return { cls: 'tag-red', label: `Vencido hace ${Math.abs(dias)}d`, dot: 'dot-red', badge: 'bad' }
    if (dias <= 15) return { cls: 'tag-red', label: `${dias} días`, dot: 'dot-red', badge: 'bad' }
    if (dias <= 45) return { cls: 'tag-amber', label: `${dias} días`, dot: 'dot-amber', badge: 'warn' }
    return { cls: 'tag-green', label: `${dias} días`, dot: 'dot-green', badge: 'ok' }
  }

  const allAlertas = [
    ...seguros.map(s => ({ ...s, _tipo: 'seguro' })),
    ...itvs.map(i => ({ ...i, _tipo: 'itv' })),
  ].sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))

  const filtered = allAlertas.filter(a => {
    if (filtro === 'todos') return true
    if (filtro === 'criticas') return diasRestantes(a.fecha_vencimiento) <= 30
    return a._tipo === filtro
  })

  async function saveSeg() {
    if (!formSeg.vehiculo_id || !formSeg.compania || !formSeg.fecha_vencimiento) return toast.error('Vehículo, compañía y vencimiento son obligatorios')
    setSaving(true)
    const data = { ...formSeg, coste: formSeg.coste ? parseFloat(formSeg.coste) : null }
    const { error } = formSeg.id
      ? await supabase.from('seguros').update(data).eq('id', formSeg.id)
      : await supabase.from('seguros').insert(data)
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success('Seguro guardado')
    setModal(null)
    loadAll()
  }

  async function saveItv() {
    if (!formItv.vehiculo_id || !formItv.fecha_vencimiento) return toast.error('Vehículo y fecha de vencimiento son obligatorios')
    setSaving(true)
    const data = { ...formItv, coste: formItv.coste ? parseFloat(formItv.coste) : null }
    const { error } = formItv.id
      ? await supabase.from('itv').update(data).eq('id', formItv.id)
      : await supabase.from('itv').insert(data)
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success('ITV guardada')
    setModal(null)
    loadAll()
  }

  async function deleteSeg(id) {
    if (!confirm('¿Eliminar este seguro?')) return
    await supabase.from('seguros').delete().eq('id', id)
    toast.success('Seguro eliminado')
    loadAll()
  }
  async function deleteItv(id) {
    if (!confirm('¿Eliminar este registro de ITV?')) return
    await supabase.from('itv').delete().eq('id', id)
    toast.success('ITV eliminada')
    loadAll()
  }

  if (loading) return <div className="loading">Cargando alertas...</div>

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          {['todos','criticas','seguro','itv'].map(f => (
            <button key={f} className={`btn ${filtro === f ? 'btn-primary' : ''}`} style={{ fontSize: 12 }} onClick={() => setFiltro(f)}>
              {{ todos: 'Todos', criticas: 'Críticas', seguro: 'Seguros', itv: 'ITV' }[f]}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => { setFormSeg(EMPTY_SEG); setModal('seguro') }}>+ Seguro</button>
          <button className="btn btn-primary" onClick={() => { setFormItv(EMPTY_ITV); setModal('itv') }}>+ ITV</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vehículo</th>
                <th>Tipo</th>
                <th className="hide-mobile">Detalle</th>
                <th>Vencimiento</th>
                <th>Días restantes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="empty">Sin alertas en esta categoría</td></tr>
              ) : filtered.map(a => {
                const estado = estadoAlerta(a.fecha_vencimiento)
                const v = a.vehiculos
                return (
                  <tr key={a.id + a._tipo}>
                    <td>
                      <div><span className="plate">{v?.matricula}</span></div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{v?.marca} {v?.modelo}</div>
                    </td>
                    <td><span className={`tag ${a._tipo === 'seguro' ? 'tag-blue' : 'tag-gray'}`}>{a._tipo === 'seguro' ? 'Seguro' : 'ITV'}</span></td>
                    <td className="hide-mobile" style={{ color: 'var(--text2)', fontSize: 12 }}>
                      {a._tipo === 'seguro' ? (a.compania || '—') : (a.estacion || '—')}
                    </td>
                    <td style={{ fontSize: 12 }}>{new Date(a.fecha_vencimiento).toLocaleDateString('es-ES')}</td>
                    <td><span className={`tag ${estado.cls}`}>{estado.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => {
                          if (a._tipo === 'seguro') { setFormSeg(a); setModal('seguro') }
                          else { setFormItv(a); setModal('itv') }
                        }}>Editar</button>
                        <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() =>
                          a._tipo === 'seguro' ? deleteSeg(a.id) : deleteItv(a.id)
                        }>✕</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Seguro */}
      {modal === 'seguro' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{formSeg.id ? 'Editar seguro' : 'Nuevo seguro'}</span>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Vehículo *</label>
                <select className="form-select" value={formSeg.vehiculo_id} onChange={e => setFormSeg(f => ({ ...f, vehiculo_id: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {vehiculos.map(v => <option key={v.id} value={v.id}>{v.matricula} — {v.marca} {v.modelo}</option>)}
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Compañía aseguradora *</label>
                  <input className="form-input" placeholder="Mutua Madrileña" value={formSeg.compania} onChange={e => setFormSeg(f => ({ ...f, compania: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nº de póliza</label>
                  <input className="form-input" placeholder="POL-12345" value={formSeg.numero_poliza} onChange={e => setFormSeg(f => ({ ...f, numero_poliza: e.target.value }))} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Fecha inicio</label>
                  <input className="form-input" type="date" value={formSeg.fecha_inicio} onChange={e => setFormSeg(f => ({ ...f, fecha_inicio: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha vencimiento *</label>
                  <input className="form-input" type="date" value={formSeg.fecha_vencimiento} onChange={e => setFormSeg(f => ({ ...f, fecha_vencimiento: e.target.value }))} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select className="form-select" value={formSeg.tipo} onChange={e => setFormSeg(f => ({ ...f, tipo: e.target.value }))}>
                    <option value="terceros">Terceros</option>
                    <option value="todo_riesgo">Todo riesgo</option>
                    <option value="terceros_ampliado">Terceros ampliado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Coste (€)</label>
                  <input className="form-input" type="number" placeholder="800" value={formSeg.coste} onChange={e => setFormSeg(f => ({ ...f, coste: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notas</label>
                <textarea className="form-textarea" value={formSeg.notas} onChange={e => setFormSeg(f => ({ ...f, notas: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveSeg} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ITV */}
      {modal === 'itv' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{formItv.id ? 'Editar ITV' : 'Nueva ITV'}</span>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Vehículo *</label>
                <select className="form-select" value={formItv.vehiculo_id} onChange={e => setFormItv(f => ({ ...f, vehiculo_id: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {vehiculos.map(v => <option key={v.id} value={v.id}>{v.matricula} — {v.marca} {v.modelo}</option>)}
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Fecha realización</label>
                  <input className="form-input" type="date" value={formItv.fecha_realizacion} onChange={e => setFormItv(f => ({ ...f, fecha_realizacion: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha vencimiento *</label>
                  <input className="form-input" type="date" value={formItv.fecha_vencimiento} onChange={e => setFormItv(f => ({ ...f, fecha_vencimiento: e.target.value }))} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Resultado</label>
                  <select className="form-select" value={formItv.resultado} onChange={e => setFormItv(f => ({ ...f, resultado: e.target.value }))}>
                    <option value="favorable">Favorable</option>
                    <option value="desfavorable">Desfavorable</option>
                    <option value="negativa">Negativa</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Coste (€)</label>
                  <input className="form-input" type="number" placeholder="50" value={formItv.coste} onChange={e => setFormItv(f => ({ ...f, coste: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Estación ITV</label>
                <input className="form-input" placeholder="ITV Guadalquivir" value={formItv.estacion} onChange={e => setFormItv(f => ({ ...f, estacion: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Notas</label>
                <textarea className="form-textarea" value={formItv.notas} onChange={e => setFormItv(f => ({ ...f, notas: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveItv} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
