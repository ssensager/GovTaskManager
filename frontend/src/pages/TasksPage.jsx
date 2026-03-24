import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, SlidersHorizontal } from 'lucide-react'
import { tasksApi, usersApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import TaskCard from '../components/TaskCard'
import { Modal, Spinner, Empty, FormField } from '../components/ui'
import { CheckSquare } from 'lucide-react'

const PRIORITIES = [
  { value: '',         label: 'Все приоритеты' },
  { value: 'critical', label: 'Критический' },
  { value: 'high',     label: 'Высокий' },
  { value: 'medium',   label: 'Средний' },
  { value: 'low',      label: 'Низкий' },
]

export default function TasksPage() {
  const [tasks,      setTasks]      = useState([])
  const [statuses,   setStatuses]   = useState([])
  const [users,      setUsers]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [search,     setSearch]     = useState('')
  const [filters,    setFilters]    = useState({ status: '', priority: '' })
  const [creating,   setCreating]   = useState(false)
  const [form,       setForm]       = useState({
    title: '', description: '', priority: 'medium', dueDate: '', executorId: ''
  })
  const { isManager } = useAuth()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.status)   params.status   = filters.status
      if (filters.priority) params.priority = filters.priority
      if (search.trim())    params.search   = search.trim()
      const { data } = await tasksApi.getAll(params)
      setTasks(data)
    } finally {
      setLoading(false)
    }
  }, [filters, search])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    tasksApi.getStatuses().then(r => setStatuses(r.data))
    usersApi.getAll().then(r => setUsers(r.data.filter(u => u.status === 'active')))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    try {
      await tasksApi.create({
        title:       form.title,
        description: form.description,
        priority:    form.priority,
        dueDate:     new Date(form.dueDate).toISOString(),
        executorId:  form.executorId ? parseInt(form.executorId) : null,
      })
      setShowCreate(false)
      setForm({ title: '', description: '', priority: 'medium', dueDate: '', executorId: '' })
      load()
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Задачи</h1>
        {isManager && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Создать задачу
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="input pl-9 py-2"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={15} className="text-gray-400" />
          <select value={filters.status} onChange={e => setFilter('status', e.target.value)}
            className="input py-2 w-auto">
            <option value="">Все статусы</option>
            {statuses.map(s => <option key={s.statusId} value={s.statusName}>{s.statusName}</option>)}
          </select>
          <select value={filters.priority} onChange={e => setFilter('priority', e.target.value)}
            className="input py-2 w-auto">
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <span className="text-sm text-gray-400 whitespace-nowrap">{tasks.length} задач</span>
        </div>
      </div>

      {/* Tasks grid */}
      {loading ? <Spinner /> : tasks.length === 0 ? (
        <Empty text="Задачи не найдены" icon={<CheckSquare size={40} />} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(t => <TaskCard key={t.taskId} task={t} />)}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <Modal title="Создать задачу" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <FormField label="Заголовок" required>
              <input required value={form.title} onChange={e => set('title', e.target.value)}
                className="input" placeholder="Краткое название задачи" maxLength={200} />
            </FormField>
            <FormField label="Описание">
              <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                className="input resize-none" placeholder="Подробное описание задачи..." />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Приоритет" required>
                <select value={form.priority} onChange={e => set('priority', e.target.value)} className="input">
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="critical">Критический</option>
                </select>
              </FormField>
              <FormField label="Срок исполнения" required>
                <input required type="datetime-local" value={form.dueDate}
                  onChange={e => set('dueDate', e.target.value)} className="input" />
              </FormField>
            </div>
            <FormField label="Исполнитель">
              <select value={form.executorId} onChange={e => set('executorId', e.target.value)} className="input">
                <option value="">— Не назначен —</option>
                {users.map(u => (
                  <option key={u.userId} value={u.userId}>
                    {u.fullName} ({u.role?.roleName})
                  </option>
                ))}
              </select>
            </FormField>
            <div className="flex justify-end gap-3 pt-2 border-t">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Отмена</button>
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? 'Создание...' : 'Создать задачу'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
