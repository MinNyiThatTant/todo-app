<template>
  <div class="tasks-container">
    <!-- Back Button -->
    <div class="nav-header">
      <button @click="goBack" class="back-btn">
        ← Back to Dashboard
      </button>
    </div>

    <div class="tasks-header">
      <h1>My Tasks</h1>
      <button @click="showForm = !showForm" class="btn-primary">
        {{ showForm ? 'Cancel' : '+ Add New Task' }}
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <input 
        type="text" 
        v-model="filters.search" 
        placeholder="🔍 Search tasks..." 
        class="search-input"
      />
      <select v-model="filters.priority" class="filter-select">
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <select v-model="filters.status" class="filter-select">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </div>

    <!-- Add/Edit Task Form -->
    <div v-if="showForm" class="task-form">
      <h3>{{ editingTask ? 'Edit Task' : 'Create New Task' }}</h3>
      <form @submit.prevent="saveTask">
        <div class="form-group">
          <label>Title *</label>
          <input type="text" v-model="formData.title" required placeholder="Enter task title..." />
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="formData.description" rows="3" placeholder="Enter task description..."></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Due Date</label>
            <input type="date" v-model="formData.due_date" />
          </div>
          
          <div class="form-group">
            <label>Priority</label>
            <select v-model="formData.priority">
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Status</label>
            <select v-model="formData.status">
              <option value="pending">⏳ Pending</option>
              <option value="in_progress">🔄 In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Category</label>
            <select v-model="formData.category_id">
              <option :value="null">-- No Category --</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-save">{{ editingTask ? 'Update' : 'Create' }}</button>
          <button type="button" @click="resetForm" class="btn-cancel">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Tasks List -->
    <div class="tasks-list">
      <div v-if="taskStore.loading" class="loading">Loading tasks...</div>
      
      <div v-else-if="filteredTasks.length === 0" class="empty-state">
        <p>No tasks found</p>
        <button @click="showForm = true" class="btn-secondary">Create your first task</button>
      </div>
      
      <div v-for="task in filteredTasks" :key="task.id" class="task-card">
        <div class="task-header">
          <div class="task-title">
            <h3 :class="{ completed: task.status === 'completed' }">{{ task.title }}</h3>
            <span class="priority-badge" :class="task.priority">
              {{ task.priority.toUpperCase() }}
            </span>
          </div>
          <div class="task-actions">
            <button @click="editTask(task)" class="btn-edit">Edit</button>
            <button @click="handleDelete(task.id)" class="btn-delete">Delete</button>
          </div>
        </div>
        
        <p v-if="task.description" class="task-description">{{ task.description }}</p>
        
        <div class="task-meta">
          <div class="meta-item">
            <span class="label">Status:</span>
            <select v-model="task.status" @change="updateStatus(task)" class="status-select">
              <option value="pending">⏳ Pending</option>
              <option value="in_progress">🔄 In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>
          
          <div v-if="task.due_date" class="meta-item" :class="{ overdue: isOverdue(task.due_date) && task.status !== 'completed' }">
            <span class="label">Due:</span>
            <span>{{ formatDate(task.due_date) }}</span>
          </div>
          
          <div v-if="task.category_name" class="meta-item">
            <span class="label">Category:</span>
            <span>{{ task.category_name }}</span>
          </div>
          
          <div class="meta-item">
            <span class="label">Created:</span>
            <span>{{ formatDateTime(task.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '../stores/tasks';
import { useToast } from 'vue-toastification';
import api from '../services/api';

const router = useRouter();
const taskStore = useTaskStore();
const toast = useToast();

// State
const showForm = ref(false);
const editingTask = ref(null);
const categories = ref([]);
const filters = ref({
  search: '',
  priority: '',
  status: ''
});

// Form data
const formData = ref({
  title: '',
  description: '',
  due_date: '',
  priority: 'medium',
  status: 'pending',
  category_id: null
});

// Computed - Filtered tasks
const filteredTasks = computed(() => {
  let tasks = [...taskStore.tasks];
  
  if (filters.value.search) {
    tasks = tasks.filter(task => 
      task.title.toLowerCase().includes(filters.value.search.toLowerCase())
    );
  }
  
  if (filters.value.priority) {
    tasks = tasks.filter(task => task.priority === filters.value.priority);
  }
  
  if (filters.value.status) {
    tasks = tasks.filter(task => task.status === filters.value.status);
  }
  
  return tasks;
});

// Load categories
const loadCategories = async () => {
  try {
    const res = await api.get('/categories');
    categories.value = res.data;
  } catch (err) {
    console.error('Load categories error:', err);
  }
};

// Save task (Create or Update)
const saveTask = async () => {
  if (!formData.value.title.trim()) {
    toast.warning('Please enter task title');
    return;
  }
  
  try {
    if (editingTask.value) {
      await taskStore.updateTask(editingTask.value.id, formData.value);
      toast.success('Task updated successfully');
    } else {
      await taskStore.createTask(formData.value);
      toast.success('Task created successfully');
    }
    resetForm();
    await taskStore.fetchTasks();
    await loadCategories();
  } catch (err) {
    console.error('Save task error:', err);
    toast.error(err.response?.data?.message || 'Failed to save task');
  }
};

// Edit task
const editTask = (task) => {
  editingTask.value = task;
  formData.value = {
    title: task.title,
    description: task.description || '',
    due_date: task.due_date || '',
    priority: task.priority,
    status: task.status,
    category_id: task.category_id
  };
  showForm.value = true;
};

// Delete task
const handleDelete = async (id) => {
  if (confirm('Are you sure you want to delete this task?')) {
    try {
      await taskStore.deleteTask(id);
      toast.success('Task deleted successfully');
      await taskStore.fetchTasks();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete task');
    }
  }
};

// Update status only
const updateStatus = async (task) => {
  try {
    await taskStore.updateTask(task.id, { ...task });
    toast.success('Status updated');
    await taskStore.fetchTasks();
  } catch (err) {
    console.error('Status update error:', err);
    toast.error('Failed to update status');
  }
};

// Reset form
const resetForm = () => {
  showForm.value = false;
  editingTask.value = null;
  formData.value = {
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
    category_id: null
  };
};

// Go back to dashboard
const goBack = () => {
  router.push('/dashboard');
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

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Load data on mount
onMounted(async () => {
  await taskStore.fetchTasks();
  await loadCategories();
});
</script>

<style scoped>
.tasks-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-header {
  margin-bottom: 1rem;
}

.back-btn {
  padding: 0.5rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.back-btn:hover {
  background: #5a6268;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.tasks-header h1 {
  color: #42b883;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #359268;
}

.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.task-form {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.dark .task-form {
  background: #2c2c2c;
}

.task-form h3 {
  margin-bottom: 1rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-save {
  padding: 0.75rem 1.5rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.dark .task-card {
  background: #2c2c2c;
}

.task-card:hover {
  transform: translateX(5px);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.task-title h3 {
  margin: 0;
}

.task-title h3.completed {
  text-decoration: line-through;
  color: #999;
}

.priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
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

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit {
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-delete {
  padding: 0.5rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.task-description {
  margin: 0.75rem 0;
  color: #666;
}

.dark .task-description {
  color: #ccc;
}

.task-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
  font-size: 0.85rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-item .label {
  font-weight: 500;
  color: #666;
}

.meta-item.overdue {
  color: #e74c3c;
  font-weight: bold;
}

.status-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.btn-secondary {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>