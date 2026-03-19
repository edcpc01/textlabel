// src/App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { onAuth } from './lib/firebase'
import { Topbar } from './components/Topbar'
import { LoginPage } from './pages/LoginPage'
import { ProducaoPage } from './pages/ProducaoPage'
import { CadastroPage } from './pages/CadastroPage'
import { RelatorioPage } from './pages/RelatorioPage'
import { ConfigPage } from './pages/ConfigPage'
import './styles/global.css'

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = loading

  useEffect(() => {
    const unsub = onAuth(u => setUser(u))
    return unsub
  }, [])

  if (user === undefined) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--accent)', fontSize: '.85rem' }}>Carregando...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          className: 'toast-custom',
          style: { background: '#1a2d47', border: '1px solid #254870', color: '#e2eaf4' },
          success: { iconTheme: { primary: '#00e5a0', secondary: '#000' } },
          error:   { iconTheme: { primary: '#ff4466', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/*" element={
          <ProtectedRoute user={user}>
            <Topbar user={user} />
            <Routes>
              <Route index            element={<ProducaoPage />} />
              <Route path="producao"  element={<ProducaoPage />} />
              <Route path="cadastro"  element={<CadastroPage />} />
              <Route path="relatorio" element={<RelatorioPage />} />
              <Route path="config"    element={<ConfigPage />} />
            </Routes>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
