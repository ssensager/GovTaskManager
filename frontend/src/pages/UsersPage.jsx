import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { UserPlus, Edit, CheckCircle2, XCircle, Search } from 'lucide-react'
import { usersApi, authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Modal, FormField, Spinner } from '../components/ui'

const ROLE_CFG = {
  Administrator: { label: 'Администратор', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  Manager:       { label: 'Руководитель',  cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  Executor:      { label: 'Исполнитель',   cls: 'bg-green-100 text-green-700 border-green-200' },
}

const STATUS_CFG = {
  active:   { label: 'Активен',    cls: 'text-green-600', icon: CheckCircle2 },
  inactive: { label: 'Неактивен',  cls: 'text-gray-400',  icon: XCircle },
  blocked:  { label: 'Заблокирован', cls: 'text-red-500', icon: XCircle },
}

export default function UsersPage() {
  const [users,       setUsers]       = useState([])
  const [roles,       setRoles]       = useState([])
  const [departments, setDepartments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [editUser,    setEditUser]    = useState(null)
  const [showCreate,  setShowCreate]  = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [editForm,    setEditForm]    = useState({})
  const [createForm,  setCreateForm]  = useState({
    fullName: '', position: '', email: '', phone: '', login: '',
    password: '', roleId: '', departmentId: ''
  })
  const { isAdmin } = useAuth()

  async function load() {
    setLoading(true)
    try { const { data } = await usersApi.getAll(); setUsers(data) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    usersApi.getRoles().then(r => setRoles(r.data))
    usersApi.getDepartments().then(r => setDepartments(r.data))
  }, [])

  function openEdit(u) {
    setEditUser(u)
    setEditForm({
      fullName:     u.fullName,
      position:     u.position     || '',
      email:        u.email,
      phone:        u.phone        || '',
      status:       u.status,
      roleId:       u.role.roleId,
      departmentId: u.department?.departmentId || '',
    })
  }

  async function handleEdit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await usersApi.update(editUser.userId, {
        ...editForm,
        roleId:       parseInt(editForm.roleId),
        departmentId: editForm.departmentId ? parseInt(editForm.departmentId) : null,
      })
      setEditUser(null)
      load()
    } finally { setSaving(false) }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await usersApi.create({
        ...createForm,
        roleId:       parseInt(createForm.roleId),
        departmentId: createForm.departmentId ? parseInt(createForm.departmentId) : null,
      })
      setShowCreate(false)
      setCreateForm({ fullName:'',position:'',email:'',phone:'',login:'',password:'',roleId:'',departmentId:'' })
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка создания пользователя')
    } finally { setSaving(false) }
  }

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.login.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const setE = (k, v) => setEditForm(f => ({...f, [k]: v}))
  const setC = (k, v) => setCreateForm(f => ({...f, [k]: v}))

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-gray-900">В разработке</h1>
         
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <UserPlus size={16} /> Добавить пользователя
          </button>
        )}
      </div>

      Search
      <div className="card p-4 flex items-center gap-3">
        <Search size={15} className="text-gray-400 flex-shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по имени, логину или email..."
          className="flex-1 outline-none text-sm text-gray-700 bg-transparent" />
        <span className="text-sm text-gray-400">{filtered.length} из {users.length}</span>
      </div>

      {loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Сотрудник', 'Отдел / Должность', 'Роль', 'Статус', 'Дата добавления', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(u => {
                const roleCfg   = ROLE_CFG[u.role?.roleName]   || ROLE_CFG.Executor
                const statusCfg = STATUS_CFG[u.status]         || STATUS_CFG.active
                const StatusIcon = statusCfg.icon
                return (
                  <tr key={u.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-semibold">
                            {u.fullName.split(' ').map(w=>w[0]).slice(0,2).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{u.fullName}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                          {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-gray-700">{u.department?.departmentName || '—'}</p>
                      {u.position && <p className="text-xs text-gray-400">{u.position}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleCfg.cls}`}>
                        {roleCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${statusCfg.cls}`}>
                        <StatusIcon size={14} />
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {format(new Date(u.createdAt), 'dd.MM.yyyy')}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {isAdmin && (
                        <button onClick={() => openEdit(u)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      {editUser && (
        <Modal title={`Редактировать: ${editUser.fullName}`} onClose={() => setEditUser(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <FormField label="ФИО" required>
              <input required value={editForm.fullName} onChange={e => setE('fullName', e.target.value)} className="input" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Должность">
                <input value={editForm.position} onChange={e => setE('position', e.target.value)} className="input" />
              </FormField>
              <FormField label="Телефон">
                <input value={editForm.phone} onChange={e => setE('phone', e.target.value)} className="input" />
              </FormField>
            </div>
            <FormField label="Email" required>
              <input required type="email" value={editForm.email} onChange={e => setE('email', e.target.value)} className="input" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Роль" required>
                <select required value={editForm.roleId} onChange={e => setE('roleId', e.target.value)} className="input">
                  {roles.map(r => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}
                </select>
              </FormField>
              <FormField label="Статус">
                <select value={editForm.status} onChange={e => setE('status', e.target.value)} className="input">
                  <option value="active">Активен</option>
                  <option value="inactive">Неактивен</option>
                  <option value="blocked">Заблокирован</option>
                </select>
              </FormField>
            </div>
            <FormField label="Отдел">
              <select value={editForm.departmentId} onChange={e => setE('departmentId', e.target.value)} className="input">
                <option value="">— Не указан —</option>
                {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
              </select>
            </FormField>
            <div className="flex justify-end gap-3 pt-2 border-t">
              <button type="button" onClick={() => setEditUser(null)} className="btn-secondary">Отмена</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create modal */}
      {showCreate && (
        <Modal title="Добавить пользователя" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <FormField label="ФИО" required>
              <input required value={createForm.fullName} onChange={e => setC('fullName', e.target.value)} className="input" placeholder="Иванов Иван Иванович" />
            </FormField>
            <FormField label="Должность">
              <input value={createForm.position} onChange={e => setC('position', e.target.value)} className="input" placeholder="Специалист отдела..." />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Логин" required>
                <input required value={createForm.login} onChange={e => setC('login', e.target.value)} className="input" placeholder="ivanov" />
              </FormField>
              <FormField label="Пароль" required>
                <input required type="password" value={createForm.password} onChange={e => setC('password', e.target.value)} className="input" placeholder="Минимум 6 символов" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Email" required>
                <input required type="email" value={createForm.email} onChange={e => setC('email', e.target.value)} className="input" />
              </FormField>
              <FormField label="Телефон">
                <input value={createForm.phone} onChange={e => setC('phone', e.target.value)} className="input" placeholder="+7 (495) 000-00-00" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Роль" required>
                <select required value={createForm.roleId} onChange={e => setC('roleId', e.target.value)} className="input">
                  <option value="">— Выберите роль —</option>
                  {roles.map(r => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}
                </select>
              </FormField>
              <FormField label="Отдел">
                <select value={createForm.departmentId} onChange={e => setC('departmentId', e.target.value)} className="input">
                  <option value="">— Не указан —</option>
                  {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
                </select>
              </FormField>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Отмена</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Создание...' : 'Создать пользователя'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
