<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <h1>Dashboard</h1>
      <p class="welcome-text">Welcome back, {{ userName }}!</p>
    </div>
    
    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
        <div class="stat-value">{{ stats.totalTasks || 0 }}</div>
        <div class="stat-label">Total Tasks</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
        <div class="stat-value">{{ stats.completedTasks || 0 }}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
        <div class="stat-value">{{ stats.pendingTasks || 0 }}</div>
        <div class="stat-label">Pending</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
        <div class="stat-value">{{ stats.completionRate || 0 }}%</div>
        <div class="stat-label">Completion Rate</div>
      </div>
    </div>
    
    <!-- Recent Tasks -->
    <div class="recent-tasks">
      <div class="section-header">
        <h2>Recent Tasks</h2>
        <router-link to="/tasks" class="view-all">View All →</router-link>
      </div>
      
      <div v-if="taskStore.loading" class="loading">Loading...</div>
      
      <div v-else-if="recentTasks.length === 0" class="empty-state">
        <p>No tasks yet.</p>
        <router-link to="/tasks" class="btn-secondary">Create your first task</router-link>
      </div>
      
      <div v-for="task in recentTasks" :key="task.id" class="task-card">
        <div class="task-header">
          <h3 :class="{ completed: task.status === 'completed' }">{{ task.title }}</h3>
          <span class="priority-badge" :class="task.priority">
            {{ task.priority.toUpperCase() }}
          </span>
        </div>
        <p v-if="task.description" class="task-description">{{ truncate(task.description, 100) }}</p>
        <div class="task-meta">
          <span v-if="task.due_date" class="due-date" :class="{ overdue: isOverdue(task.due_date) && task.status !== 'completed' }">
            Due: {{ formatDate(task.due_date) }}
          </span>
          <span v-if="task.category_name" class="category">
            {{ task.category_name }}
          </span>
          <span class="status" :class="task.status">
            {{ task.status }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="action-buttons">
        <router-link to="/tasks" class="action-btn">
          Create New Task
        </router-link>
        <router-link to="/categories" class="action-btn">
          Manage Categories
        </router-link>
        <router-link to="/reports" class="action-btn">
          View Reports
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useTaskStore } from '../stores/tasks';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const taskStore = useTaskStore();
const toast = useToast();

// State
const stats = ref({
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  completionRate: 0
});

const recentTasks = ref([]);

// Computed
const userName = computed(() => authStore.user?.name || 'User');

// Methods
const loadDashboard = async () => {
  try {
    // Fetch all tasks
    await taskStore.fetchTasks();
    const allTasks = taskStore.tasks;
    
    // Calculate statistics
    stats.value.totalTasks = allTasks.length;
    stats.value.completedTasks = allTasks.filter(t => t.status === 'completed').length;
    stats.value.pendingTasks = allTasks.filter(t => t.status !== 'completed').length;
    stats.value.completionRate = stats.value.totalTasks > 0 
      ? Math.round((stats.value.completedTasks / stats.value.totalTasks) * 100)
      : 0;
    
    // Get recent tasks (last 5 by created date)
    recentTasks.value = [...allTasks]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
      
  } catch (err) {
    console.error('Dashboard load error:', err);
    toast.error('Failed to load dashboard data');
  }
};

// Helper functions
const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
};

const formatDate = (dateString) => {
  if (!dateString) return 'No due date';
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString();
};

const truncate = (text, length) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Lifecycle
onMounted(() => {
  loadDashboard();
});
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 2rem;
}

.welcome-section h1 {
  color: #42b883;
  margin-bottom: 0.5rem;
}

.welcome-text {
  color: #666;
  font-size: 1.1rem;
}

.dark .welcome-text {
  color: #ccc;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  color: white;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
}

.stat-label {
  margin-top: 0.5rem;
  opacity: 0.9;
  font-size: 0.9rem;
}

.recent-tasks {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.dark .recent-tasks {
  background: #2c2c2c;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  color: #333;
}

.dark .section-header h2 {
  color: #f0f0f0;
}

.view-all {
  color: #42b883;
  text-decoration: none;
  font-size: 0.9rem;
}

.view-all:hover {
  text-decoration: underline;
}

.task-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: transform 0.2s;
}

.dark .task-card {
  background: #1a1a1a;
}

.task-card:hover {
  transform: translateX(5px);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.task-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.task-header h3.completed {
  text-decoration: line-through;
  color: #999;
}

.priority-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
}

.priority-badge.high {
  background: #e74c3c;
  color: white;
}

.priority-badge.medium {
  background: #f39c12;
  color: white;
}

.priority-badge.low {
  background: #27ae60;
  color: white;
}

.task-description {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.dark .task-description {
  color: #ccc;
}

.task-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.8rem;
}

.due-date {
  color: #666;
}

.due-date.overdue {
  color: #e74c3c;
  font-weight: bold;
}

.category {
  color: #42b883;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  font-size: 0.7rem;
}

.status.pending {
  background: #f39c12;
  color: white;
}

.status.in_progress {
  background: #3498db;
  color: white;
}

.status.completed {
  background: #27ae60;
  color: white;
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.btn-secondary {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #42b883;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.3s;
}

.btn-secondary:hover {
  background: #359268;
}

.quick-actions {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
}

.dark .quick-actions {
  background: #2c2c2c;
}

.quick-actions h2 {
  color: #333;
  margin-bottom: 1rem;
}

.dark .quick-actions h2 {
  color: #f0f0f0;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: block;
  text-align: center;
  padding: 1rem;
  background: #42b883;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: transform 0.2s, background 0.3s;
}

.action-btn:hover {
  background: #359268;
  transform: translateY(-2px);
}
</style>