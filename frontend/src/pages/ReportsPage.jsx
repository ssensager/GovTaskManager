import { useState, useEffect } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { format } from 'date-fns'
import { Download, RefreshCw } from 'lucide-react'
import { reportsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Spinner, StatCard } from '../components/ui'
import { CheckSquare, TrendingUp, AlertTriangle, Users } from 'lucide-react'

const PRIORITY_LABELS = { low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический' }

export default function ReportsPage() {
  const [report,  setReport]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [from,    setFrom]    = useState('')
  const [to,      setTo]      = useState('')
  const { isManager } = useAuth()

  async function load() {
    setLoading(true)
    try {
      const params = {}
      if (from) params.from = new Date(from).toISOString()
      if (to)   params.to   = new Date(to).toISOString()
      const { data } = await reportsApi.getData(params)
      setReport(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await reportsApi.save({
        reportType:  'tasks',
        periodStart: from ? new Date(from).toISOString() : new Date('2020-01-01').toISOString(),
        periodEnd:   to   ? new Date(to).toISOString()   : new Date().toISOString(),
      })
      alert('Отчёт сохранён в базе данных')
    } finally { setSaving(false) }
  }

  const priorityData = report?.byPriority.map(p => ({
    name:  PRIORITY_LABELS[p.priority] || p.priority,
    value: p.count,
    fill:  p.color,
  })) || []

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Отчёты и аналитика</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="input py-2 w-auto text-sm" placeholder="От" />
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="input py-2 w-auto text-sm" placeholder="До" />
          <button onClick={load} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={14} /> Обновить
          </button>
          {isManager && (
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
              <Download size={14} /> {saving ? 'Сохранение...' : 'Сохранить отчёт'}
            </button>
          )}
        </div>
      </div>

      {loading ? <Spinner /> : !report ? null : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Всего задач"   value={report.stats.totalTasks}      icon={CheckSquare}   colorClass="bg-blue-600"   bgClass="bg-blue-50" />
            <StatCard title="Выполнено"     value={report.stats.completedTasks}  icon={TrendingUp}    colorClass="bg-green-600"  bgClass="bg-green-50" />
            <StatCard title="Просрочено"    value={report.stats.overdueTasks}    icon={AlertTriangle} colorClass="bg-red-500"    bgClass="bg-red-50" />
            <StatCard title="Активных польз." value={report.stats.activeUsers}   icon={Users}         colorClass="bg-indigo-500" bgClass="bg-indigo-50" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* By status pie */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-5">Задачи по статусу</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={report.byStatus} dataKey="count" nameKey="status"
                    cx="50%" cy="50%" outerRadius={90} innerRadius={45}
                    label={({ status, count }) => `${count}`}>
                    {report.byStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                  <Legend
                    formatter={(value) => <span className="text-xs text-gray-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* By priority bar */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-5">Задачи по приоритету</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={priorityData} barSize={44}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Задач" radius={[5,5,0,0]}>
                    {priorityData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status counts table */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Сводка по статусам</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {report.byStatus.map(s => (
                <div key={s.status} className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-center">
                  <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ background: s.color }} />
                  <p className="text-xl font-bold text-gray-800">{s.count}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* By executor table */}
          {report.byExecutor.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Производительность исполнителей</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left pb-3 text-gray-500 font-medium">Сотрудник</th>
                      <th className="text-center pb-3 text-gray-500 font-medium">Всего</th>
                      <th className="text-center pb-3 text-gray-500 font-medium">Выполнено</th>
                      <th className="text-center pb-3 text-gray-500 font-medium">Просрочено</th>
                      <th className="pb-3 text-gray-500 font-medium">% выполнения</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {report.byExecutor.map((e, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-4 font-medium text-gray-800">{e.fullName}</td>
                        <td className="py-3 text-center text-gray-600">{e.total}</td>
                        <td className="py-3 text-center text-green-600 font-semibold">{e.completed}</td>
                        <td className="py-3 text-center text-red-500 font-semibold">{e.overdue}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-24">
                              <div className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${e.completionRate}%` }} />
                            </div>
                            <span className="text-xs text-gray-600 w-10 text-right">{e.completionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
           )} 
        </>
      )}
    </div>
  )
}
