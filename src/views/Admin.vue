<template>
  <div class="container">
    <h1>Admin Dashboard</h1>
    
    <!-- Statistics Section -->
    <div class="stats-section">
      <h2>System Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalUsers }}</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalTasks }}</div>
          <div class="stat-label">Total Tasks</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.completedTasks }}</div>
          <div class="stat-label">Completed Tasks</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.pendingTasks }}</div>
          <div class="stat-label">Pending Tasks</div>
        </div>
      </div>
    </div>

    <!-- Users Management Section -->
    <div class="users-section">
      <h2>User Management</h2>
      <div class="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <select 
                  v-model="user.role" 
                  @change="updateUserRole(user.id, user.role)"
                  :disabled="user.id === currentUserId"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <button 
                  @click="deleteUser(user.id)" 
                  class="delete-btn"
                  :disabled="user.id === currentUserId"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- All Tasks Section -->
    <div class="tasks-section">
      <h2>All User Tasks</h2>
      <div class="filters">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search tasks..." 
          class="search-input"
        />
        <select v-model="statusFilter">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      <div class="tasks-list">
        <div v-for="task in filteredTasks" :key="task.id" class="task-card">
          <div class="task-header">
            <h3>{{ task.title }}</h3>
            <span class="task-status" :class="task.status">{{ task.status }}</span>
          </div>
          <p class="task-description">{{ task.description }}</p>
          <div class="task-meta">
            <span>User ID: {{ task.user_id }}</span>
            <span>Due: {{ task.due_date || 'No due date' }}</span>
            <span>Priority: {{ task.priority }}</span>
          </div>
        </div>
        <div v-if="filteredTasks.length === 0" class="empty-state">
          No tasks found
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'

const users = ref([])
const allTasks = ref([])
const stats = ref({
  totalUsers: 0,
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0
})
const searchQuery = ref('')
const statusFilter = ref('')
const toast = useToast()
const authStore = useAuthStore()
const currentUserId = authStore.user?.id

// Filtered tasks
const filteredTasks = computed(() => {
  let filtered = allTasks.value
  
  if (searchQuery.value) {
    filtered = filtered.filter(task => 
      task.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (statusFilter.value) {
    filtered = filtered.filter(task => task.status === statusFilter.value)
  }
  
  return filtered
})

// Fetch all users (admin only)
const fetchUsers = async () => {
  try {
    const res = await api.get('/users')
    users.value = res.data
    stats.value.totalUsers = res.data.length
  } catch (err) {
    toast.error('Failed to load users')
  }
}

// Fetch all tasks (admin only)
const fetchAllTasks = async () => {
  try {
    const res = await api.get('/tasks?all=true')
    allTasks.value = res.data
    stats.value.totalTasks = res.data.length
    stats.value.completedTasks = res.data.filter(t => t.status === 'completed').length
    stats.value.pendingTasks = res.data.filter(t => t.status !== 'completed').length
  } catch (err) {
    toast.error('Failed to load tasks')
  }
}

// Update user role
const updateUserRole = async (userId, newRole) => {
  try {
    await api.put(`/users/${userId}/role`, { role: newRole })
    toast.success('User role updated')
  } catch (err) {
    toast.error('Failed to update user role')
    fetchUsers() // Refresh to revert
  }
}

// Delete user
const deleteUser = async (userId) => {
  if (confirm('Are you sure you want to delete this user? This will delete all their tasks.')) {
    try {
      await api.delete(`/users/${userId}`)
      toast.success('User deleted successfully')
      fetchUsers()
      fetchAllTasks()
    } catch (err) {
      toast.error('Failed to delete user')
    }
  }
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

onMounted(() => {
  fetchUsers()
  fetchAllTasks()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #42b883;
  margin-bottom: 2rem;
}

h2 {
  color: #333;
  margin-bottom: 1rem;
  margin-top: 2rem;
}

.dark h2 {
  color: #f0f0f0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.dark .stat-card {
  background: #2c2c2c;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #42b883;
}

.stat-label {
  margin-top: 0.5rem;
  color: #666;
}

.dark .stat-label {
  color: #ccc;
}

.users-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
}

.dark table {
  background: #2c2c2c;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.dark th, .dark td {
  border-bottom-color: #444;
}

th {
  background: #42b883;
  color: white;
  font-weight: 600;
}

select {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.task-card {
  background: #f9f9f9;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
}

.dark .task-card {
  background: #2c2c2c;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.task-header h3 {
  margin: 0;
  color: #42b883;
}

.task-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.task-status.pending {
  background: #f39c12;
  color: white;
}

.task-status.in_progress {
  background: #3498db;
  color: white;
}

.task-status.completed {
  background: #27ae60;
  color: white;
}

.task-description {
  margin: 0.5rem 0;
  color: #666;
}

.dark .task-description {
  color: #ccc;
}

.task-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #999;
}

.delete-btn {
  padding: 0.25rem 0.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}
</style>