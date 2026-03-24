import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  login:  (data)  => api.post('/auth/login', data),
  me:     ()      => api.get('/auth/me'),
}

// ── Users ─────────────────────────────────────────────
export const usersApi = {
  getAll:          ()        => api.get('/users'),
  getById:         (id)      => api.get(`/users/${id}`),
  create:          (data)    => api.post('/users', data),
  update:          (id,data) => api.put(`/users/${id}`, data),
  remove:          (id)      => api.delete(`/users/${id}`),
  getRoles:        ()        => api.get('/users/roles'),
  getDepartments:  ()        => api.get('/users/departments'),
}

// ── Tasks ─────────────────────────────────────────────
export const tasksApi = {
  getAll:      (params)    => api.get('/tasks', { params }),
  getById:     (id)        => api.get(`/tasks/${id}`),
  create:      (data)      => api.post('/tasks', data),
  update:      (id, data)  => api.put(`/tasks/${id}`, data),
  remove:      (id)        => api.delete(`/tasks/${id}`),
  addComment:  (id, data)  => api.post(`/tasks/${id}/comments`, data),
  getStatuses: ()          => api.get('/tasks/statuses'),
}

// ── Reports ───────────────────────────────────────────
export const reportsApi = {
  getData:     (params) => api.get('/reports', { params }),
  save:        (data)   => api.post('/reports/save', data),
  getAuditLog: (params) => api.get('/reports/audit', { params }),
}

// ── Events ────────────────────────────────────────────
export const eventsApi = {
  getMyEvents: ()       => api.get('/events'),
  create:      (data)   => api.post('/events', data),
  remove:      (id)     => api.delete(`/events/${id}`),
}

export default api
