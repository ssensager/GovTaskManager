import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm]       = useState({ login: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const { login }             = useAuth()
  const navigate              = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      login({
        userId:         data.userId,
        fullName:       data.fullName,
        login:          data.login,
        role:           data.role,
        position:       data.position,
        departmentName: data.departmentName,
      }, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Неверный логин или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg,#1a3c8f 0%,#0f2460 60%,#061540 100%)' }}>

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Shield size={22} className="text-white" />
          </div>
          <span className="font-bold text-xl">КИС</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Корпоративная информационная система<br />управления поручениями
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed">
            Эффективное управление поручениями, контроль исполнения<br />
            и аналитика для государственных организаций
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { num: '3', label: 'Уровня доступа' },
              { num: '100%', label: 'Аудит действий' },
              { num: '∞', label: 'Задач и проектов' },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-white">{num}</p>
                <p className="text-blue-300 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-400 text-sm">© 2026 Министерство строительства, архитектуры и имущественных отношений Новгородской области</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">КИС</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Вход в систему</h2>
              <p className="text-gray-500 text-sm mt-1">Введите учётные данные для входа</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Логин</label>
                <input
                  type="text"
                  value={form.login}
                  onChange={e => set('login', e.target.value)}
                  className="input"
                  placeholder="Введите логин"
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="label">Пароль</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    className="input pr-10"
                    placeholder="Введите пароль"
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPwd(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Вход...
                    </span>
                  : 'Войти в систему'}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">Тестовые аккаунты:</p>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="font-mono bg-white px-2 py-0.5 rounded border">admin</span>
                  <span className="text-gray-400">Admin123!</span>
                  <span className="text-purple-600 font-medium">Администратор</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono bg-white px-2 py-0.5 rounded border">ivanov</span>
                  <span className="text-gray-400">Manager123!</span>
                  <span className="text-blue-600 font-medium">Руководитель</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono bg-white px-2 py-0.5 rounded border">petrova</span>
                  <span className="text-gray-400">Executor123!</span>
                  <span className="text-green-600 font-medium">Исполнитель</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
