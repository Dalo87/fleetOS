import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatDistanceToNow, isPast, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Dashboard() {
  const [stats, setStats] = useState({ vehiculos: 0, alertas: 0, itvProximas: 0, gastoMes: 0 })
  const [alertas, setAlertas] = useState([])
  const [incidencias, setIncidencias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    const [veh, seg, itv, inc, gas] = await Promise.all([
      supabase.from('vehiculos').select('id').eq('activo', true),
      supabase.from('seguros').select('*, vehiculos(matricula, marca, modelo, conductor)'),
      supabase.from('itv').select('*, vehiculos(matricula, marca, modelo, conductor)'),
      supabase.from('incidencias').select('*, vehiculos(matricula)').order('created_at', { ascending: false }).limit(5),
      supabase.from('gastos').select('importe, fecha'),
    ])

    const totalVeh = veh.data?.length || 0

    const ahora = new Date()
    const en60 = new Date(); en60.setDate(en60.getDate() + 60)
    const en30 = new Date(); en30.setDate(en30.getDate() + 30)
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

    const alertasSeg = (seg.data || [])
      .filter(s => new Date(s.fecha_vencimiento) <= en60)
      .map(s => ({ tipo: 'seguro', ...s }))

    const alertasItv = (itv.data || [])
      .filter(i => new Date(i.fecha_vencimiento) <= en60)
      .map(i => ({ tipo: 'itv', ...i }))

    const todasAlertas = [...alertasSeg, ...alertasItv]
      .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))

    const itvProx = (itv.data || []).filter(i => {
      const d = new Date(i.fecha_vencimiento)
      return d >= ahora && d <= en30
    }).length

    const gastoMes = (gas.data || [])
      .filter(g => new Date(g.fecha) >= inicioMes)
      .reduce((acc, g) => acc + (g.importe || 0), 0)

    const criticas = todasAlertas.filter(a => new Date(a.fecha_vencimiento) <= en30)

    setStats({ vehiculos: totalVeh, alertas: criticas.length, itvProximas: itvProx, gastoMes })
    setAlertas(todasAlertas.slice(0, 4))
    setIncidencias(inc.data || [])
    setLoading(false)
  }

  if (loading) return <div className="loading">Cargando dashboard...</div>

  return (
    <>
      <div className="metrics">
        <div className="metric">
          <div className="metric-label">Total vehículos</div>
          <div className="metric-value">{stats.vehiculos}</div>
          <div className="metric-sub">Flota activa</div>
        </div>
        <div className="metric metric-red">
          <div className="metric-label">Alertas críticas</div>
          <div className="metric-value">{stats.alertas}</div>
          <div className="metric-sub">Requieren atención</div>
        </div>
        <div className="metric metric-amber">
          <div className="metric-label">ITV próximas</div>
          <div className="metric-value">{stats.itvProximas}</div>
          <div className="metric-sub">Próximos 30 días</div>
        </div>
        <div className="metric metric-amber">
          <div className="metric-label">Gasto este mes</div>
          <div className="metric-value">{stats.gastoMes.toLocaleString('es-ES')}€</div>
          <div className="metric-sub">Acumulado</div>
        </div>
      </div>

      <div className="section-header">
        <span className="section-title">Alertas recientes</span>
        <Link to="/alertas" style={{ fontSize: 12, color: 'var(--text2)', textDecoration: 'none' }}>Ver todas →</Link>
      </div>

      {alertas.length === 0 ? (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="empty">✓ Sin alertas activas — todo en orden</div>
        </div>
      ) : (
        <div className="alert-list">
          {alertas.map((a, i) => {
            const venc = new Date(a.fecha_vencimiento)
            const vencido = isPast(venc)
            const dias = differenceInDays(venc, new Date())
            const v = a.vehiculos
            return (
              <div className="alert-card" key={i}>
                <div className={`alert-dot ${vencido ? 'dot-red' : dias <= 15 ? 'dot-red' : 'dot-amber'}`} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span className="plate">{v?.matricula}</span>
                    <span className={`tag ${vencido ? 'tag-red' : 'tag-amber'}`}>
                      {a.tipo === 'seguro' ? 'Seguro' : 'ITV'} {vencido ? 'vencido' : `en ${dias} días`}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{v?.marca} {v?.modelo} {v?.conductor ? `· ${v.conductor}` : ''}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    Vencimiento: {venc.toLocaleDateString('es-ES')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="section-header">
        <span className="section-title">Últimas incidencias</span>
        <Link to="/incidencias" style={{ fontSize: 12, color: 'var(--text2)', textDecoration: 'none' }}>Ver todas →</Link>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vehículo</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {incidencias.length === 0 ? (
                <tr><td colSpan={5} className="empty">Sin incidencias registradas</td></tr>
              ) : incidencias.map(inc => (
                <tr key={inc.id}>
                  <td><span className="plate">{inc.vehiculos?.matricula}</span></td>
                  <td><TipoTag tipo={inc.tipo} /></td>
                  <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.descripcion}</td>
                  <td style={{ color: 'var(--text2)' }}>{new Date(inc.fecha).toLocaleDateString('es-ES')}</td>
                  <td><EstadoText estado={inc.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export function TipoTag({ tipo }) {
  const map = { golpe: 'tag-amber', averia: 'tag-red', revision: 'tag-blue', otro: 'tag-gray' }
  const labels = { golpe: 'Golpe', averia: 'Avería', revision: 'Revisión', otro: 'Otro' }
  return <span className={`tag ${map[tipo] || 'tag-gray'}`}>{labels[tipo] || tipo}</span>
}

export function EstadoText({ estado }) {
  const map = { abierta: 'warn', en_taller: 'warn', resuelta: 'ok' }
  const labels = { abierta: 'Abierta', en_taller: 'En taller', resuelta: 'Resuelta' }
  return <span className={map[estado] || ''}>{labels[estado] || estado}</span>
}
