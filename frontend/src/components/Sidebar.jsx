import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, BarChart2,
  Users, Shield, ChevronRight, Building2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Рабочий стол', roles: null },
  { to: '/tasks',     icon: CheckSquare,     label: 'Задачи',        roles: null },
  { to: '/reports',   icon: BarChart2,       label: 'Отчёты',        roles: null },
  { to: '/users',     icon: Users,           label: 'Пользователи',  roles: ['Administrator'] },
  { to: '/audit',     icon: Shield,          label: 'Журнал аудита', roles: ['Administrator'] },
]

export default function Sidebar() {
  const { user, isAdmin } = useAuth()

  return (
    <aside className="w-64 flex flex-col shadow-xl flex-shrink-0"
      style={{ background: 'linear-gradient(180deg,#1a3c8f 0%,#0f2460 100%)' }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">КИС</p>
            <p className="text-blue-300 text-xs">Управление поручениями</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label, roles }) => {
          if (roles && !roles.includes(user?.role)) return null
          return (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`
            }>
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-white/60" />}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User badge */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-400/30 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {user?.fullName?.split(' ').map(w => w[0]).slice(0, 2).join('') || '?'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.fullName}</p>
            <p className="text-blue-300 text-xs truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
