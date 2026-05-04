import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
}

export const jobsAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  getMatched: () => api.post('/jobs/match'),
  getStats: () => api.get('/jobs/stats/overview')
}

export const alertsAPI = {
  getSpikes: () => api.get('/alerts/spikes'),
  getTrends: () => api.get('/alerts/trends'),
  getUsage: () => api.get('/alerts/usage')
}

export const subscriptionAPI = {
  getStatus: () => api.get('/subscriptions/status'),
  createCheckout: () => api.post('/subscriptions/create-checkout'),
  cancel: () => api.post('/subscriptions/cancel'),
  getPlans: () => api.get('/subscriptions/plans')
}

export const trackerAPI = {
  getApplications: (params) => api.get('/tracker/applications', { params }),
  createApplication: (data) => api.post('/tracker/applications', data),
  updateStatus: (id, data) => api.put(`/tracker/applications/${id}/status`, data),
  updateApplication: (id, data) => api.put(`/tracker/applications/${id}`, data),
  deleteApplication: (id) => api.delete(`/tracker/applications/${id}`),
  bulkUpdate: (data) => api.post('/tracker/applications/bulk-update', data),
  getAnalytics: () => api.get('/tracker/analytics'),
  getFollowUps: () => api.get('/tracker/follow-ups')
}

export const exportAPI = {
  exportExcel: (jobIds) => api.get('/export/excel', {
    params: { jobIds: jobIds?.join(',') },
    responseType: 'blob'
  }),
  exportCSV: (jobIds) => api.get('/export/csv', {
    params: { jobIds: jobIds?.join(',') },
    responseType: 'blob'
  })
}

export default api
