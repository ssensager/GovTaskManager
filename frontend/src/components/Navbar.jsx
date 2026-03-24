import { LogOut, User, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ROLE_LABELS = {
  Administrator: 'Администратор',
  Manager:       'Руководитель',
  Executor:      'Исполнитель',
}

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm hidden md:block">
          Добро пожаловать, <span className="text-gray-700 font-medium">{user?.fullName?.split(' ')[1] || user?.fullName}</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Role badge */}
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {ROLE_LABELS[user?.role] || user?.role}
        </span>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {user?.fullName?.split(' ').map(w => w[0]).slice(0, 2).join('') || '?'}
            </span>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-gray-700 leading-none">{user?.fullName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{user?.departmentName || user?.login}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title="Выйти из системы"
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  )
}
