import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Shield, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { reportsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui'
import { Navigate } from 'react-router-dom'

const ACTION_CFG = {
  LOGIN:        { cls: 'bg-blue-100 text-blue-700',   label: 'ВХОД' },
  LOGIN_FAILED: { cls: 'bg-red-100 text-red-700',     label: 'ВХОД НЕУДАЧНЫЙ' },
  LOGOUT:       { cls: 'bg-gray-100 text-gray-600',   label: 'ВЫХОД' },
  CREATE:       { cls: 'bg-green-100 text-green-700', label: 'СОЗДАНИЕ' },
  UPDATE:       { cls: 'bg-yellow-100 text-yellow-700', label: 'ИЗМЕНЕНИЕ' },
  DELETE:       { cls: 'bg-red-100 text-red-600',     label: 'УДАЛЕНИЕ' },
  VIEW:         { cls: 'bg-gray-100 text-gray-500',   label: 'ПРОСМОТР' },
}

const ACTION_TYPES = ['', 'LOGIN', 'LOGIN_FAILED', 'CREATE', 'UPDATE', 'DELETE']

export default function AuditPage() {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  const [logs,       setLogs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(1)
  const [actionType, setActionType] = useState('')
  const PAGE_SIZE = 50

  async function load(p = page) {
    setLoading(true)
    try {
      const { data } = await reportsApi.getAuditLog({
        page: p, pageSize: PAGE_SIZE, actionType: actionType || undefined
      })
      setLogs(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, actionType])

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield size={22} className="text-blue-600" />
          В разработке
        </h1>
        <div className="flex items-center gap-3">
          <select value={actionType} onChange={e => { setActionType(e.target.value); setPage(1) }}
            className="input py-2 w-auto text-sm">
            <option value="">Все действия</option>
            {ACTION_TYPES.slice(1).map(a => (
              <option key={a} value={a}>{ACTION_CFG[a]?.label || a}</option>
            ))}
          </select>
          <button onClick={() => load(page)} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={14} /> Обновить
          </button>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Дата и время', 'Пользователь', 'Действие', 'Объект', 'ID объекта', 'IP-адрес', 'Детали'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Записи не найдены</td></tr>
              ) : logs.map(log => {
                const cfg = ACTION_CFG[log.actionType] || { cls: 'bg-gray-100 text-gray-600', label: log.actionType }
                return (
                  <tr key={log.logId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 font-mono">
                      {format(new Date(log.timestamp), 'dd.MM.yyyy HH:mm:ss')}
                    </td>
                    <td className="px-4 py-3">
                      {log.user ? (
                        <div>
                          <p className="font-medium text-gray-800">{log.user.fullName}</p>
                          <p className="text-gray-400">{log.user.login}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Система</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{log.objectType}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono">{log.objectId ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono">{log.ipAddress || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{log.details || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Страница {page}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-gray-700 w-8 text-center">{page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={logs.length < PAGE_SIZE}
                className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
