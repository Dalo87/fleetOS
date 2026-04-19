import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const EMPTY = { nombre: '', especialidad: '', telefono: '', direccion: '', ciudad: '', valoracion: 5, asociado: false, urgencias: false, notas: '' }

export default function Talleres() {
  const [talleres, setTalleres] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('talleres').select('*').order('nombre')
    setTalleres(data || [])
    setLoading(false)
  }

  function openNew() { setForm(EMPTY); setModal(true) }
  function openEdit(t) { setForm(t); setModal(true) }

  async function save() {
    if (!form.nombre) return toast.error('El nombre es obligatorio')
    setSaving(true)
    const data = { ...form, valoracion: parseInt(form.valoracion) }
    const { error } = form.id
      ? await supabase.from('talleres').update(data).eq('id', form.id)
      : await supabase.from('talleres').insert(data)
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success(form.id ? 'Taller actualizado' : 'Taller añadido')
    setModal(false)
    load()
  }

  async function remove(id) {
    if (!confirm('¿Eliminar este taller?')) return
    await supabase.from('talleres').delete().eq('id', id)
    toast.success('Taller eliminado')
    load()
  }

  function stars(n) {
    return '★'.repeat(n) + '☆'.repeat(5 - n)
  }

  const filtered = talleres.filter(t =>
    t.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (t.ciudad || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.especialidad || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <input className="search-input" placeholder="Buscar taller, ciudad..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={openNew}>+ Añadir taller</button>
      </div>

      {loading ? <div className="loading">Cargando talleres...</div> : (
        filtered.length === 0 ? (
          <div className="empty">Sin talleres registrados. Añade el primero.</div>
        ) : (
          <div className="workshop-grid">
            {filtered.map(t => (
              <div className="workshop-card" key={t.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div className="workshop-name">{t.nombre}</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => openEdit(t)}>Editar</button>
                    <button className="btn btn-danger" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => remove(t.id)}>✕</button>
                  </div>
                </div>
                {t.especialidad && <div className="workshop-spec">{t.especialidad}</div>}
                <div className="stars">{stars(t.valoracion || 0)}</div>
                {t.ciudad && <div className="workshop-city">{t.direccion ? `${t.direccion} · ` : ''}{t.ciudad}</div>}
                {t.telefono && (
                  <a href={`tel:${t.telefono}`} className="workshop-phone" style={{ textDecoration: 'none' }}>
                    📞 {t.telefono}
                  </a>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {t.asociado && <span className="tag tag-blue">Asociado</span>}
                  {t.urgencias && <span className="tag tag-red">Urgencias 24h</span>}
                  {!t.asociado && !t.urgencias && <span className="tag tag-gray">Taller general</span>}
                </div>
                {t.notas && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>{t.notas}</div>}
              </div>
            ))}
          </div>
        )
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{form.id ? 'Editar taller' : 'Nuevo taller'}</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nombre del taller *</label>
                <input className="form-input" placeholder="Talleres García" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Especialidad</label>
                <input className="form-input" placeholder="Mecánica general, Chapa y pintura..." value={form.especialidad} onChange={e => setForm(f => ({ ...f, especialidad: e.target.value }))} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input className="form-input" placeholder="+34 956 000 000" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ciudad</label>
                  <input className="form-input" placeholder="San Fernando" value={form.ciudad} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input className="form-input" placeholder="Ctra. de Málaga, km 3" value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Valoración: {form.valoracion}/5</label>
                <input type="range" min="1" max="5" step="1" value={form.valoracion} onChange={e => setForm(f => ({ ...f, valoracion: e.target.value }))} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.asociado} onChange={e => setForm(f => ({ ...f, asociado: e.target.checked }))} />
                  Taller asociado
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.urgencias} onChange={e => setForm(f => ({ ...f, urgencias: e.target.checked }))} />
                  Urgencias 24h
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Notas</label>
                <textarea className="form-textarea" placeholder="Descuentos, condiciones especiales..." value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
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
