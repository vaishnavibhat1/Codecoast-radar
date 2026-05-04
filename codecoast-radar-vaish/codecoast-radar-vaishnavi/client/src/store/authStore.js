import { create } from 'zustand'
import { authAPI } from '../utils/api'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  
  login: async (credentials) => {
    const { data } = await authAPI.login(credentials)
    localStorage.setItem('token', data.token)
    set({ user: data.user, token: data.token })
    return data
  },
  
  register: async (userData) => {
    const { data } = await authAPI.register(userData)
    localStorage.setItem('token', data.token)
    set({ user: data.user, token: data.token })
    return data
  },
  
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
  
  updateUser: (user) => set({ user })
}))
