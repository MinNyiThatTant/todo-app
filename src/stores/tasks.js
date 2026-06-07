import { defineStore } from 'pinia';
import api from '../services/api';

export const useTaskStore = defineStore('tasks', {
    state: () => ({
        tasks: [],
        loading: false,
        error: null
    }),
    
    actions: {
        async fetchTasks() {
            this.loading = true;
            try {
                const response = await api.get('/tasks');  // ← /tasks ဖြစ်ရမယ် (baseURL က /api ပါပြီ)
                this.tasks = response.data;
                this.error = null;
                console.log('Tasks fetched:', this.tasks.length);
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to fetch tasks';
                console.error('Fetch tasks error:', err);
            } finally {
                this.loading = false;
            }
        },
        
        async createTask(taskData) {
            try {
                const response = await api.post('/tasks', taskData);
                this.tasks.unshift(response.data);
                console.log('Task created:', response.data);
                return response.data;
            } catch (err) {
                console.error('Create task error:', err);
                throw err;
            }
        },
        
        async updateTask(id, taskData) {
            try {
                const response = await api.put(`/tasks/${id}`, taskData);
                const index = this.tasks.findIndex(t => t.id === id);
                if (index !== -1) {
                    this.tasks[index] = response.data;
                }
                console.log('Task updated:', response.data);
                return response.data;
            } catch (err) {
                console.error('Update task error:', err);
                throw err;
            }
        },
        
        async deleteTask(id) {
            try {
                await api.delete(`/tasks/${id}`);
                this.tasks = this.tasks.filter(t => t.id !== id);
                console.log('Task deleted:', id);
            } catch (err) {
                console.error('Delete task error:', err);
                throw err;
            }
        }
    }
});