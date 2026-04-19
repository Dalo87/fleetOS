import { useState } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Flota from './pages/Flota'
import Alertas from './pages/Alertas'
import Incidencias from './pages/Incidencias'
import Talleres from './pages/Talleres'
import Gastos from './pages/Gastos'

const NAV = [
  { to: '/', label: 'Dashboard', icon: <GridIcon /> },
  { to: '/flota', label: 'Flota', icon: <CarIcon /> },
  { to: '/alertas', label: 'Alertas', icon: <BellIcon /> },
  { to: '/incidencias', label: 'Incidencias', icon: <AlertIcon /> },
  { to: '/talleres', label: 'Talleres', icon: <WrenchIcon /> },
  { to: '/gastos', label: 'Gastos', icon: <EuroIcon /> },
]

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const pageTitle = {
    '/': 'Dashboard',
    '/flota': 'Flota de vehículos',
    '/alertas': 'Alertas activas',
    '/incidencias': 'Incidencias',
    '/talleres': 'Talleres',
    '/gastos': 'Gastos e historial',
  }[location.pathname] || 'FleetCaprichos'

  return (
    <div className="app">
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="7" width="14" height="5" rx="2" fill="white"/>
              <rect x="3" y="4" width="8" height="4" rx="1.5" fill="white" opacity="0.6"/>
              <circle cx="4" cy="12" r="1.5" fill="#1a1a1a"/>
              <circle cx="12" cy="12" r="1.5" fill="#1a1a1a"/>
            </svg>
          </div>
          FleetCaprichos
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect x="2" y="4" width="16" height="2" rx="1"/>
              <rect x="2" y="9" width="16" height="2" rx="1"/>
              <rect x="2" y="14" width="16" height="2" rx="1"/>
            </svg>
          </button>
          <span className="topbar-title">{pageTitle}</span>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/flota" element={<Flota />} />
            <Route path="/alertas" element={<Alertas />} />
            <Route path="/incidencias" element={<Incidencias />} />
            <Route path="/talleres" element={<Talleres />} />
            <Route path="/gastos" element={<Gastos />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function GridIcon() {
  return <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>
}
function CarIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><rect x="1" y="6" width="14" height="6" rx="2"/><path d="M3 6V5a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1"/><circle cx="4.5" cy="12" r="1"/><circle cx="11.5" cy="12" r="1"/></svg>
}
function BellIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><path d="M8 2a5 5 0 0 0-5 5v3l-1 2h12l-1-2V7a5 5 0 0 0-5-5z"/><path d="M6.5 13a1.5 1.5 0 0 0 3 0"/></svg>
}
function AlertIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5"/><circle cx="8" cy="11" r="0.5" fill="currentColor"/></svg>
}
function WrenchIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><path d="M10.5 2a3.5 3.5 0 0 0-3.36 4.52L2 11.5 4.5 14l5-5.14A3.5 3.5 0 1 0 10.5 2z"/></svg>
}
function EuroIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><path d="M11 4.5A5 5 0 1 0 11 11.5"/><path d="M3 7h6M3 9h6"/></svg>
}
