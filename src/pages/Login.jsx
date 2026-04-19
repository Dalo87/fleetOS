import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    if (!email || !password) return toast.error('Introduce email y contraseña')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) toast.error('Email o contraseña incorrectos')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0ede8',
      padding: '20px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: 860,
        minHeight: 520,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>

        {/* Panel izquierdo — ilustración */}
        <div style={{
          flex: 1,
          background: '#0f1923',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 36,
          minWidth: 260,
          overflow: 'hidden',
        }}>
          {/* Carretera */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 110, background: '#1a2332' }} />
          {/* Líneas de carretera */}
          {[0, 130, 260, 390].map((x, i) => (
            <div key={i} style={{ position: 'absolute', bottom: 50, left: x, width: 90, height: 4, background: '#f5c842', borderRadius: 2 }} />
          ))}
          {/* Halo de faros */}
          <div style={{ position: 'absolute', bottom: 55, left: -40, width: 320, height: 220, borderRadius: '50%', background: 'rgba(255,240,180,0.06)', transform: 'rotate(-10deg)' }} />
          <div style={{ position: 'absolute', bottom: 55, left: 10, width: 200, height: 150, borderRadius: '50%', background: 'rgba(255,240,180,0.05)', transform: 'rotate(-10deg)' }} />

          {/* Coche SVG */}
          <svg viewBox="0 0 360 140" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: 42, left: 20, width: '85%', maxWidth: 320 }}>
            <rect x="30" y="55" width="280" height="55" rx="8" fill="#1e3a5f"/>
            <rect x="60" y="30" width="200" height="40" rx="8" fill="#1a3356"/>
            <rect x="65" y="35" width="88" height="27" rx="4" fill="#4a9eff" opacity="0.55"/>
            <rect x="163" y="35" width="88" height="27" rx="4" fill="#4a9eff" opacity="0.45"/>
            <rect x="30" y="95" width="280" height="15" rx="4" fill="#152a45"/>
            <circle cx="80" cy="116" r="19" fill="#111"/>
            <circle cx="80" cy="116" r="11" fill="#1e1e1e"/>
            <circle cx="80" cy="116" r="5" fill="#333"/>
            <circle cx="272" cy="116" r="19" fill="#111"/>
            <circle cx="272" cy="116" r="11" fill="#1e1e1e"/>
            <circle cx="272" cy="116" r="5" fill="#333"/>
            <rect x="296" y="63" width="18" height="14" rx="3" fill="#f5c842"/>
            <rect x="26" y="63" width="18" height="14" rx="3" fill="#ff4444" opacity="0.85"/>
            <rect x="30" y="78" width="280" height="3" fill="#2a4a6f"/>
          </svg>

          {/* Círculos decorativos */}
          <div style={{ position: 'absolute', top: 24, right: 24, width: 56, height: 56, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', top: 38, right: 38, width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />

          {/* Texto */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 10 }}>
              Gestión de<br/>flota inteligente
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
              Controla seguros, ITV,<br/>incidencias y gastos en un solo lugar.
            </div>
          </div>
        </div>

        {/* Panel derecho — formulario */}
        <div style={{
          width: 360,
          background: '#ffffff',
          padding: '44px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{
              width: 38, height: 38,
              background: '#1a1a1a',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="7" width="14" height="5" rx="2" fill="white"/>
                <rect x="3" y="4" width="8" height="4" rx="1.5" fill="white" opacity="0.6"/>
                <circle cx="4" cy="12" r="1.5" fill="#1a1a1a"/>
                <circle cx="12" cy="12" r="1.5" fill="#1a1a1a"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.3px' }}>FleetCaprichos</div>
              <div style={{ fontSize: 11, color: '#9c9a92', marginTop: 1 }}>Panel de administración</div>
            </div>
          </div>

          <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.4px', marginBottom: 4 }}>Bienvenido</div>
          <div style={{ fontSize: 13, color: '#9c9a92', marginBottom: 28 }}>Introduce tus credenciales para acceder</div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b6b66', marginBottom: 6 }}>
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '10px 13px',
                  border: '0.5px solid #d3d1c7',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#1a1a18',
                  outline: 'none',
                  fontFamily: 'inherit',
                  background: '#fafaf8',
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b6b66', marginBottom: 6 }}>
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '10px 13px',
                  border: '0.5px solid #d3d1c7',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#1a1a18',
                  outline: 'none',
                  fontFamily: 'inherit',
                  background: '#fafaf8',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#555' : '#1a1a1a',
                color: '#fff',
                border: 'none',
                borderRadius: 9,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '-0.2px',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Entrando...' : 'Entrar al panel →'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 24, fontSize: 11, color: '#b4b2a9' }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#b4b2a9" strokeWidth="1.5">
              <path d="M8 2L3 4v5c0 3 2.5 5 5 5s5-2 5-5V4L8 2z"/>
            </svg>
            Acceso seguro y cifrado · Solo personal autorizado
          </div>
        </div>
      </div>
    </div>
  )
}
