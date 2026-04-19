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
      background: 'var(--bg)',
      padding: '20px',
    }}>
      <div style={{
        background: 'var(--bg2)',
        border: '0.5px solid var(--border)',
        borderRadius: '12px',
        padding: '36px',
        width: '100%',
        maxWidth: '380px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{
            width: 36, height: 36,
            background: '#1a1a1a',
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="7" width="14" height="5" rx="2" fill="white"/>
              <rect x="3" y="4" width="8" height="4" rx="1.5" fill="white" opacity="0.6"/>
              <circle cx="4" cy="12" r="1.5" fill="#1a1a1a"/>
              <circle cx="12" cy="12" r="1.5" fill="#1a1a1a"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.3px' }}>FleetCaprichos</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Gestión de flota</div>
          </div>
        </div>

        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 6, letterSpacing: '-0.3px' }}>Iniciar sesión</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>Accede a tu panel de flota</div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 14, marginTop: 8 }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
