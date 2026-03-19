// src/components/Topbar.jsx
import { useNavigate, NavLink } from 'react-router-dom'
import { Printer, FileText, BarChart2, Settings, LogOut } from 'lucide-react'
import { logout } from '../lib/firebase'

export function Topbar({ user }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/producao',  label: 'Produção',  Icon: Printer },
    { to: '/cadastro',  label: 'Cadastro',  Icon: FileText },
    { to: '/relatorio', label: 'Relatório', Icon: BarChart2 },
    { to: '/config',    label: 'Config',    Icon: Settings },
  ]

  return (
    <nav className="topbar">
      <div className="topbar-brand">
        <div className="topbar-brand-icon">TL</div>
        <div>
          <div className="topbar-brand-name">TextLabel</div>
          <div className="topbar-brand-sub">ETIQUETAS PRO</div>
        </div>
      </div>

      <div className="topbar-nav">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </div>

      <div className="topbar-right">
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          <LogOut size={13} /> Sair
        </button>
      </div>
    </nav>
  )
}
