// src/pages/LoginPage.jsx
import { useState } from 'react'
import { login } from '../lib/firebase'
import toast from 'react-hot-toast'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !pwd) { toast.error('Preencha e-mail e senha.'); return }
    setLoading(true)
    try {
      await login(email, pwd)
    } catch (err) {
      toast.error('Credenciais inválidas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">FL</div>
          <div className="login-logo-title">TextLabel</div>
          <div className="login-logo-sub">Sistema de Etiquetas de Produção</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              className="form-control"
              type="email"
              placeholder="usuario@empresa.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              className="form-control"
              type="password"
              placeholder="••••••••"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
