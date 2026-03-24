import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowLeft, User, Calendar, Send, Trash2, Clock, History, Edit3, Check, X } from 'lucide-react'
import { tasksApi, usersApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { StatusBadge, PriorityBadge, Spinner, Modal, FormField } from '../components/ui'

const PRIORITY_LABELS = { low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический' }

export default function TaskDetailPage() {
  const { id }                        = useParams()
  const navigate                      = useNavigate()
  const { user, isManager, isAdmin }  = useAuth()
  const [task,       setTask]         = useState(null)
  const [statuses,   setStatuses]     = useState([])
  const [allUsers,   setAllUsers]     = useState([])
  const [comment,    setComment]      = useState('')
  const [sending,    setSending]      = useState(false)
  const [loading,    setLoading]      = useState(true)
  const [showEdit,   setShowEdit]     = useState(false)
  const [editForm,   setEditForm]     = useState({})
  const [saving,     setSaving]       = useState(false)
  const [activeTab,  setActiveTab]    = useState('comments')

  async function load() {
    const { data } = await tasksApi.getById(id)
    setTask(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    tasksApi.getStatuses().then(r => setStatuses(r.data))
    if (isManager) usersApi.getAll().then(r => setAllUsers(r.data.filter(u => u.status === 'active')))
  }, [id])

  async function handleStatusChange(statusId) {
    await tasksApi.update(id, { statusId: parseInt(statusId), historyComment: 'Статус изменён' })
    load()
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!comment.trim()) return
    setSending(true)
    try {
      await tasksApi.addComment(id, { text: comment })
      setComment('')
      load()
    } finally { setSending(false) }
  }

  async function handleDelete() {
    if (!confirm('Удалить задачу? Это действие нельзя отменить.')) return
    await tasksApi.remove(id)
    navigate('/tasks')
  }

  function openEdit() {
    setEditForm({
      title:       task.title,
      description: task.description,
      priority:    task.priority,
      dueDate:     format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm"),
      executorId:  task.executor?.userId || '',
    })
    setShowEdit(true)
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await tasksApi.update(id, {
        title:       editForm.title,
        description: editForm.description,
        priority:    editForm.priority,
        dueDate:     new Date(editForm.dueDate).toISOString(),
        executorId:  editForm.executorId ? parseInt(editForm.executorId) : 0,
      })
      setShowEdit(false)
      load()
    } finally { setSaving(false) }
  }

  if (loading) return <Spinner />
  if (!task)   return <div className="text-center text-gray-500 mt-20">Задача не найдена</div>

  const isOverdue = task.isOverdue

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Back + title */}
      <div className="flex items-start gap-3">
        <Link to="/tasks" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 mt-0.5 flex-shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold text-gray-900 leading-snug">{task.title}</h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isManager && (
                <button onClick={openEdit}
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors">
                  <Edit3 size={14} /> Редактировать
                </button>
              )}
              {isManager && (
                <button onClick={handleDelete}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">#{task.taskId}</span>
            {isOverdue && (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                ⚠ Просрочено
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Описание</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {task.description || <span className="text-gray-400 italic">Описание не указано</span>}
            </p>
          </div>

          {/* Tabs */}
          <div className="card overflow-hidden">
            <div className="flex border-b border-gray-100">
              {[
                { key: 'comments', label: `Комментарии (${task.comments?.length || 0})` },
                { key: 'history',  label: `История (${task.history?.length || 0})` },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {task.comments?.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-6">Комментариев пока нет</p>
                  )}
                  {task.comments?.map(c => (
                    <div key={c.commentId} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">
                          {c.author.fullName.split(' ').map(w => w[0]).slice(0,2).join('')}
                        </span>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-800">{c.author.fullName}</span>
                          <span className="text-xs text-gray-400">
                            {format(new Date(c.createdAt), 'dd.MM.yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{c.text}</p>
                      </div>
                    </div>
                  ))}
                  <form onSubmit={handleComment} className="flex gap-2 pt-2 border-t">
                    <input value={comment} onChange={e => setComment(e.target.value)}
                      placeholder="Добавить комментарий..."
                      className="input flex-1 py-2" />
                    <button type="submit" disabled={sending || !comment.trim()}
                      className="btn-primary px-3 py-2">
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3">
                  {task.history?.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-6">История изменений пуста</p>
                  )}
                  {task.history?.map(h => (
                    <div key={h.historyId} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <History size={12} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">{h.changedBy.fullName}</span>
                          {h.oldStatus && h.newStatus && (
                            <> изменил статус: <span className="text-gray-500 line-through">{h.oldStatus}</span>
                            {' → '}<span className="font-medium text-blue-700">{h.newStatus}</span></>
                          )}
                          {!h.oldStatus && h.newStatus && (
                            <> создал задачу со статусом <span className="font-medium text-blue-700">{h.newStatus}</span></>
                          )}
                        </div>
                        {h.comment && <p className="text-xs text-gray-400 mt-0.5">{h.comment}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(h.changedAt), 'dd.MM.yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar details */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            {/* Status */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Статус</p>
              {isManager ? (
                <select value={task.status.statusId} onChange={e => handleStatusChange(e.target.value)}
                  className="input py-2">
                  {statuses.map(s => <option key={s.statusId} value={s.statusId}>{s.statusName}</option>)}
                </select>
              ) : (
                <StatusBadge status={task.status?.statusName} />
              )}
            </div>

            {/* Priority */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Приоритет</p>
              <PriorityBadge priority={task.priority} />
            </div>

            {/* Deadline */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar size={11} /> Срок исполнения
              </p>
              <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
                {format(new Date(task.dueDate), 'd MMMM yyyy, HH:mm', { locale: ru })}
              </p>
            </div>

            {/* Executor */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User size={11} /> Исполнитель
              </p>
              {task.executor ? (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-700 text-xs font-semibold">
                      {task.executor.fullName.split(' ').map(w=>w[0]).slice(0,2).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{task.executor.fullName}</p>
                    {task.executor.position && <p className="text-xs text-gray-400">{task.executor.position}</p>}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Не назначен</p>
              )}
            </div>

            {/* Creator */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Создано</p>
              <p className="text-sm text-gray-700">{task.creator.fullName}</p>
              <p className="text-xs text-gray-400">{format(new Date(task.createdAt), 'dd.MM.yyyy HH:mm')}</p>
            </div>

            {/* Completed */}
            {task.completedAt && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Check size={11} /> Выполнено
                </p>
                <p className="text-xs text-green-600 font-medium">
                  {format(new Date(task.completedAt), 'dd.MM.yyyy HH:mm')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <Modal title="Редактировать задачу" onClose={() => setShowEdit(false)}>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <FormField label="Заголовок" required>
              <input required value={editForm.title} onChange={e => setEditForm(f=>({...f,title:e.target.value}))}
                className="input" />
            </FormField>
            <FormField label="Описание">
              <textarea rows={3} value={editForm.description}
                onChange={e => setEditForm(f=>({...f,description:e.target.value}))}
                className="input resize-none" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Приоритет">
                <select value={editForm.priority} onChange={e => setEditForm(f=>({...f,priority:e.target.value}))} className="input">
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="critical">Критический</option>
                </select>
              </FormField>
              <FormField label="Срок">
                <input type="datetime-local" value={editForm.dueDate}
                  onChange={e => setEditForm(f=>({...f,dueDate:e.target.value}))} className="input" />
              </FormField>
            </div>
            <FormField label="Исполнитель">
              <select value={editForm.executorId} onChange={e => setEditForm(f=>({...f,executorId:e.target.value}))} className="input">
                <option value="">— Не назначен —</option>
                {allUsers.map(u => (
                  <option key={u.userId} value={u.userId}>{u.fullName}</option>
                ))}
              </select>
            </FormField>
            <div className="flex justify-end gap-3 pt-2 border-t">
              <button type="button" onClick={() => setShowEdit(false)} className="btn-secondary">Отмена</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
