// src/pages/LoginPage.jsx
import { useState } from 'react'
import { login, cadastrarUser, resetSenha, loginGoogle } from '../lib/firebase'
import toast from 'react-hot-toast'

export function LoginPage() {
  const [modo, setModo]       = useState('login')
  const [nome, setNome]       = useState('')
  const [email, setEmail]     = useState('')
  const [pwd, setPwd]         = useState('')
  const [pwd2, setPwd2]       = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (modo === 'login') {
        if (!email || !pwd) { toast.error('Preencha e-mail e senha.'); return }
        await login(email, pwd)

      } else if (modo === 'cadastro') {
        if (!nome)          { toast.error('Informe seu nome.'); return }
        if (!email)         { toast.error('Informe o e-mail.'); return }
        if (pwd.length < 6) { toast.error('Senha deve ter no mínimo 6 caracteres.'); return }
        if (pwd !== pwd2)   { toast.error('As senhas não coincidem.'); return }
        await cadastrarUser(nome, email, pwd)
        toast.success('Conta criada! Você já está logado.')

      } else if (modo === 'reset') {
        if (!email) { toast.error('Informe o e-mail.'); return }
        await resetSenha(email)
        toast.success('E-mail de redefinição enviado! Verifique sua caixa de entrada.')
        setModo('login')
      }
    } catch (err) {
      const msgs = {
        'auth/user-not-found':      'Usuário não encontrado.',
        'auth/wrong-password':      'Senha incorreta.',
        'auth/invalid-credential':  'Credenciais inválidas.',
        'auth/email-already-in-use':'E-mail já cadastrado.',
        'auth/invalid-email':       'E-mail inválido.',
        'auth/weak-password':       'Senha fraca. Use pelo menos 6 caracteres.',
      }
      toast.error(msgs[err.code] || err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoadingGoogle(true)
    try {
      await loginGoogle()
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Erro ao entrar com Google: ' + (err.message || err.code))
      }
    } finally {
      setLoadingGoogle(false)
    }
  }

  const titles = {
    login:    { title: 'Entrar',          sub: 'Sistema de Etiquetas de Produção' },
    cadastro: { title: 'Criar Conta',     sub: 'Novo usuário TextLabel' },
    reset:    { title: 'Redefinir Senha', sub: 'Enviaremos um link para seu e-mail' },
  }

  const showGoogle = modo === 'login' || modo === 'cadastro'

  return (
    <div className="login-wrap">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">TL</div>
          <div className="login-logo-title">TextLabel</div>
          <div className="login-logo-sub">{titles[modo].sub}</div>
        </div>

        {/* Botão Google */}
        {showGoogle && (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loadingGoogle}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10,
                padding: '10px 16px', borderRadius: 6,
                background: '#fff', color: '#333',
                border: '1px solid #ddd', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '.88rem', fontWeight: 600,
                transition: 'box-shadow .15s',
                opacity: loadingGoogle ? .6 : 1,
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.15)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              {/* Google SVG icon */}
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.16 2.86L38.4 6.1C34.6 2.32 29.6 0 24 0 14.62 0 6.64 5.48 2.88 13.44l7.4 5.75C12.1 13.14 17.6 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.28 28.8A14.5 14.5 0 0 1 9.5 24c0-1.67.3-3.28.77-4.8L2.88 13.44A23.93 23.93 0 0 0 0 24c0 3.77.9 7.34 2.46 10.52l7.82-5.72z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.4 0-11.9-3.62-13.72-8.7l-7.82 5.72C6.64 42.52 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              {loadingGoogle ? 'Aguarde...' : (modo === 'login' ? 'Entrar com Google' : 'Cadastrar com Google')}
            </button>

            {/* Divisor */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              margin: '16px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>ou use e-mail</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
          </>
        )}

        {/* Form e-mail/senha */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {modo === 'cadastro' && (
            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input className="form-control" type="text" placeholder="Seu nome"
                value={nome} onChange={e => setNome(e.target.value)} autoFocus />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input className="form-control" type="email" placeholder="usuario@empresa.com"
              value={email} onChange={e => setEmail(e.target.value)}
              autoFocus={modo !== 'cadastro'} />
          </div>

          {modo !== 'reset' && (
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input className="form-control" type="password" placeholder="••••••••"
                value={pwd} onChange={e => setPwd(e.target.value)} />
            </div>
          )}

          {modo === 'cadastro' && (
            <div className="form-group">
              <label className="form-label">Confirmar Senha</label>
              <input className="form-control" type="password" placeholder="••••••••"
                value={pwd2} onChange={e => setPwd2(e.target.value)} />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
          >
            {loading ? 'Aguarde...' : titles[modo].title}
          </button>
        </form>

        {/* Links de navegação */}
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          {modo === 'login' && (
            <>
              <button onClick={() => setModo('reset')}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text2)', fontSize: '.78rem', textDecoration: 'underline' }}>
                Esqueceu a senha?
              </button>
              <button onClick={() => setModo('cadastro')}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--accent)', fontSize: '.78rem', textDecoration: 'underline' }}>
                Criar nova conta
              </button>
            </>
          )}
          {(modo === 'cadastro' || modo === 'reset') && (
            <button onClick={() => setModo('login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text2)', fontSize: '.78rem', textDecoration: 'underline' }}>
              ← Voltar para o login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
