import { X } from 'lucide-react'

// ── StatusBadge ──────────────────────────────────────
const STATUS_CFG = {
  'Новая':        { cls: 'bg-gray-100 text-gray-700 border-gray-300',     dot: 'bg-gray-400' },
  'В работе':     { cls: 'bg-blue-50 text-blue-700 border-blue-200',      dot: 'bg-blue-500' },
  'На проверке':  { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200',dot: 'bg-yellow-500' },
  'Выполнена':    { cls: 'bg-green-50 text-green-700 border-green-200',   dot: 'bg-green-500' },
  'Отменена':     { cls: 'bg-red-50 text-red-500 border-red-200',         dot: 'bg-red-400' },
}

export function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG['Новая']
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  )
}

// ── PriorityBadge ────────────────────────────────────
const PRIORITY_CFG = {
  low:      { label: 'Низкий',      cls: 'bg-gray-100 text-gray-600' },
  medium:   { label: 'Средний',     cls: 'bg-blue-100 text-blue-700' },
  high:     { label: 'Высокий',     cls: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Критический', cls: 'bg-red-100 text-red-700 font-bold' },
}

export function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CFG[priority] || PRIORITY_CFG.medium
  return (
    <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ── Modal ────────────────────────────────────────────
export function Modal({ title, onClose, children, size = 'md' }) {
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${widths[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Spinner ──────────────────────────────────────────
export function Spinner({ text = 'Загрузка...' }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-sm">{text}</p>
    </div>
  )
}

// ── Empty ────────────────────────────────────────────
export function Empty({ text = 'Нет данных', icon }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
      {icon && <div className="text-gray-300">{icon}</div>}
      <p className="text-sm">{text}</p>
    </div>
  )
}

// ── StatCard ─────────────────────────────────────────
export function StatCard({ title, value, icon: Icon, colorClass, bgClass, trend }) {
  return (
    <div className={`${bgClass || 'bg-white'} rounded-xl p-5 shadow-sm border border-white/50 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass || 'bg-blue-500'}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
        <p className="text-sm text-gray-500 truncate">{title}</p>
      </div>
    </div>
  )
}

// ── FormField ────────────────────────────────────────
export function FormField({ label, required, children, hint }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}
