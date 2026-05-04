import { create } from 'zustand'
import io from 'socket.io-client'
import toast from 'react-hot-toast'

let socket = null

export const useSocketStore = create((set, get) => ({
  isConnected: false,
  notifications: [],
  socket: null,
  
  connect: (token) => {
    if (socket?.connected) {
      set({ socket })
      return
    }
    
    socket = io('http://localhost:5000', {
      auth: { token }
    })
    
    socket.on('connect', () => {
      console.log('🔌 Socket connected')
      set({ isConnected: true, socket })
    })
    
    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected')
      set({ isConnected: false })
    })
    
    socket.on('job:alert', (data) => {
      console.log('🔔 New job alert:', data)
      
      const message = `${data.job.company} - ${data.job.title} (${data.job.matchScore}% match)`
      
      if (data.isUrgent) {
        toast.success(`🚨 PERFECT MATCH: ${message}`, {
          duration: 8000,
          style: {
            background: '#10b981',
            color: 'white'
          }
        })
      } else {
        toast.success(message, { duration: 5000 })
      }
      
      set((state) => ({
        notifications: [data, ...state.notifications].slice(0, 50)
      }))
    })
    
    socket.on('jobs:update', (data) => {
      console.log('📊 Jobs updated:', data)
      toast.success(data.message)
    })
  },
  
  disconnect: () => {
    if (socket) {
      socket.disconnect()
      socket = null
    }
    set({ isConnected: false, socket: null })
  },
  
  clearNotifications: () => set({ notifications: [] })
}))
