// src/pages/LoginPage.jsx
import { useState } from 'react'
import { login, cadastrarUser, resetSenha } from '../lib/firebase'
import toast from 'react-hot-toast'

// 3 modos: 'login' | 'cadastro' | 'reset'
export function LoginPage() {
  const [modo, setModo]       = useState('login')
  const [nome, setNome]       = useState('')
  const [email, setEmail]     = useState('')
  const [pwd, setPwd]         = useState('')
  const [pwd2, setPwd2]       = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (modo === 'login') {
        if (!email || !pwd) { toast.error('Preencha e-mail e senha.'); return }
        await login(email, pwd)

      } else if (modo === 'cadastro') {
        if (!nome)       { toast.error('Informe seu nome.'); return }
        if (!email)      { toast.error('Informe o e-mail.'); return }
        if (pwd.length < 6) { toast.error('Senha deve ter no mínimo 6 caracteres.'); return }
        if (pwd !== pwd2){ toast.error('As senhas não coincidem.'); return }
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

  const titles = {
    login:    { title: 'Entrar', sub: 'Sistema de Etiquetas de Produção' },
    cadastro: { title: 'Criar Conta', sub: 'Novo usuário TextLabel' },
    reset:    { title: 'Redefinir Senha', sub: 'Enviaremos um link para seu e-mail' },
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">TL</div>
          <div className="login-logo-title">TextLabel</div>
          <div className="login-logo-sub">{titles[modo].sub}</div>
        </div>

        {/* Form */}
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

        {/* Links de navegação entre modos */}
        <div style={{
          marginTop: 20, display: 'flex', flexDirection: 'column',
          gap: 8, alignItems: 'center',
        }}>
          {modo === 'login' && (
            <>
              <button
                onClick={() => setModo('reset')}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text2)', fontSize: '.78rem', textDecoration: 'underline' }}
              >
                Esqueceu a senha?
              </button>
              <button
                onClick={() => setModo('cadastro')}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--accent)', fontSize: '.78rem', textDecoration: 'underline' }}
              >
                Criar nova conta
              </button>
            </>
          )}

          {(modo === 'cadastro' || modo === 'reset') && (
            <button
              onClick={() => setModo('login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text2)', fontSize: '.78rem', textDecoration: 'underline' }}
            >
              ← Voltar para o login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
