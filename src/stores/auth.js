import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null
    }),
    
    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.role === 'admin'
    },
    
    actions: {
        async login(email, password) {
            try {
                const response = await api.post('/auth/login', { email, password })
                const { token, user } = response.data
                
                this.token = token
                this.user = user
                
                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(user))
                
                // Set default axios header
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`
                
                return response.data
            } catch (error) {
                throw error
            }
        },
        
        async register(name, email, password) {
            try {
                const response = await api.post('/auth/register', { name, email, password })
                return response.data
            } catch (error) {
                throw error
            }
        },
        
        logout() {
            this.user = null
            this.token = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            delete api.defaults.headers.common['Authorization']
        }
    }
})