import { defineStore } from 'pinia'
import api from '../services/api'

export const useTaskStore = defineStore('tasks', {
    state: () => ({
        tasks: [],
        loading: false,
        error: null
    }),
    
    actions: {
        async fetchTasks() {
            this.loading = true
            this.error = null
            try {
                const response = await api.get('/tasks')
                this.tasks = response.data
                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch tasks'
                throw error
            } finally {
                this.loading = false
            }
        },
        
        async createTask(taskData) {
            try {
                const response = await api.post('/tasks', taskData)
                this.tasks.unshift(response.data)
                return response.data
            } catch (error) {
                throw error
            }
        },
        
        async updateTask(id, taskData) {
            try {
                const response = await api.put(`/tasks/${id}`, taskData)
                const index = this.tasks.findIndex(t => t.id === id)
                if (index !== -1) {
                    this.tasks[index] = response.data
                }
                return response.data
            } catch (error) {
                throw error
            }
        },
        
        async deleteTask(id) {
            try {
                await api.delete(`/tasks/${id}`)
                this.tasks = this.tasks.filter(t => t.id !== id)
            } catch (error) {
                throw error
            }
        }
    }
})