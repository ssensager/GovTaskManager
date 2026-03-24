import { Link } from 'react-router-dom'
import { format, isPast, differenceInDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar, User, MessageSquare, Clock } from 'lucide-react'
import { StatusBadge, PriorityBadge } from './ui'

export default function TaskCard({ task }) {
  const deadline  = new Date(task.dueDate)
  const isOverdue = task.isOverdue
  const daysLeft  = differenceInDays(deadline, new Date())

  return (
    <Link to={`/tasks/${task.taskId}`}
      className={`block card p-4 hover:shadow-md transition-all hover:border-blue-300 group ${
        isOverdue ? 'border-red-300 bg-red-50/50' : ''
      }`}>

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
          {task.title}
        </h3>
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100">
        <StatusBadge status={task.status?.statusName} />

        <div className="flex items-center gap-3 text-xs text-gray-400">
          {task.executor && (
            <span className="flex items-center gap-1 truncate max-w-24">
              <User size={11} />
              <span className="truncate">{task.executor.fullName.split(' ')[0]}</span>
            </span>
          )}

          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-semibold' : daysLeft <= 2 ? 'text-orange-500 font-medium' : ''}`}>
            <Calendar size={11} />
            {isOverdue
              ? `Просрочено`
              : daysLeft === 0
              ? 'Сегодня'
              : format(deadline, 'dd MMM', { locale: ru })}
          </span>

          {task.commentsCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare size={11} />
              {task.commentsCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
