import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, Clock, AlertTriangle, TrendingUp, Plus, ArrowRight, CalendarDays } from 'lucide-react'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { reportsApi, tasksApi, eventsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import TaskCard from '../components/TaskCard'
import { StatCard, Spinner } from '../components/ui'

const EVENT_TYPE_CFG = {
  meeting:  { label: 'Совещание', color: 'bg-blue-500' },
  deadline: { label: 'Дедлайн',  color: 'bg-red-500' },
  reminder: { label: 'Напомин.', color: 'bg-yellow-500' },
  other:    { label: 'Другое',   color: 'bg-gray-400' },
}

export default function DashboardPage() {
  const [stats,   setStats]   = useState(null)
  const [tasks,   setTasks]   = useState([])
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)
  const { user, isManager }   = useAuth()

  useEffect(() => {
    Promise.all([
      reportsApi.getData(),
      tasksApi.getAll({ executorId: user.userId }),
      eventsApi.getMyEvents(),
    ]).then(([rep, tsk, ev]) => {
      setStats(rep.data.stats)
      setTasks(tsk.data.slice(0, 6))
      setEvents(ev.data.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [user.userId])

  if (loading) return <Spinner />

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Рабочий стол</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: ru })}
          </p>
        </div>
        {isManager && (
          <Link to="/tasks" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Создать задачу
          </Link>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Всего задач"  value={stats.totalTasks}      icon={CheckSquare}  colorClass="bg-blue-600"   bgClass="bg-blue-50" />
          <StatCard title="В работе"     value={stats.inProgressTasks} icon={TrendingUp}   colorClass="bg-indigo-500" bgClass="bg-indigo-50" />
          <StatCard title="Выполнено"    value={stats.completedTasks}  icon={CheckSquare}  colorClass="bg-green-500"  bgClass="bg-green-50" />
          <StatCard title="Просрочено"   value={stats.overdueTasks}    icon={AlertTriangle} colorClass="bg-red-500"   bgClass="bg-red-50" />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* My tasks */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              Мои задачи
            </h2>
            <Link to="/tasks" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Все задачи <ArrowRight size={14} />
            </Link>
          </div>
          {tasks.length === 0 ? (
            <div className="card p-10 text-center text-gray-400 text-sm border-dashed">
              Нет назначенных задач
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tasks.map(t => <TaskCard key={t.taskId} task={t} />)}
            </div>
          )}
        </div>

        {/* Events */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <CalendarDays size={18} className="text-blue-600" />
            Ближайшие события
          </h2>
          <div className="card divide-y divide-gray-100">
            {events.length === 0 ? (
              <p className="p-5 text-center text-gray-400 text-sm">Нет событий</p>
            ) : events.map(ev => {
              const cfg = EVENT_TYPE_CFG[ev.eventType] || EVENT_TYPE_CFG.other
              const start = new Date(ev.startDatetime)
              return (
                <div key={ev.eventId} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.color}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isToday(start) ? 'Сегодня' : isTomorrow(start) ? 'Завтра' : format(start, 'dd MMM', { locale: ru })}
                      {' · '}{format(start, 'HH:mm')}
                    </p>
                    <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-xs text-white ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
