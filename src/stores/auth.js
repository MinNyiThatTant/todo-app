import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null
    }),
    actions: {
        async login(email, password) {
            const res = await api.post('/auth/login', { email, password })
            this.user = res.data.user
            this.token = res.data.token
            localStorage.setItem('user', JSON.stringify(this.user))
            localStorage.setItem('token', this.token)
            return res.data
        },
        async register(name, email, password) {
            const res = await api.post('/auth/register', { name, email, password })
            return res.data
        },
        logout() {
            this.user = null
            this.token = null
            localStorage.removeItem('user')
            localStorage.removeItem('token')
        }
    }
})