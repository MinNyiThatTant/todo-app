<template>
  <div class="categories-container">
    <!-- Back Button -->
    <div class="nav-header">
      <button @click="goBack" class="back-btn">
        ← Back to Dashboard
      </button>
    </div>

    <h1>Categories</h1>
    
    <!-- Add Category Form -->
    <div class="add-category-form">
      <form @submit.prevent="createCategory">
        <input 
          type="text" 
          v-model="newCategoryName" 
          placeholder="Enter category name..."
          required
        />
        <button type="submit" :disabled="loading" class="btn-add">
          + Add Category
        </button>
      </form>
    </div>
    
    <!-- Categories List -->
    <div class="categories-list">
      <div v-if="loading" class="loading">Loading...</div>
      
      <div v-else-if="categories.length === 0" class="empty-state">
        No categories yet. Create your first category!
      </div>
      
      <div v-for="category in categories" :key="category.id" class="category-item">
        <div class="category-info">
          <span class="category-name">{{ category.name }}</span>
          <span class="category-badge" :class="{ 'system-badge': !category.user_id }">
            {{ category.user_id ? 'Personal' : 'System' }}
          </span>
        </div>
        <button 
          v-if="category.user_id" 
          @click="deleteCategory(category.id)" 
          class="delete-btn"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import api from '../services/api';

const router = useRouter();
const toast = useToast();

// State
const categories = ref([]);
const newCategoryName = ref('');
const loading = ref(false);

// Go back to dashboard
const goBack = () => {
  router.push('/dashboard');
};

// Fetch categories
const fetchCategories = async () => {
  loading.value = true;
  try {
    const res = await api.get('/categories');
    categories.value = res.data;
  } catch (err) {
    console.error('Fetch categories error:', err);
    toast.error('Failed to load categories');
  } finally {
    loading.value = false;
  }
};

// Create category
const createCategory = async () => {
  if (!newCategoryName.value.trim()) {
    toast.warning('Please enter category name');
    return;
  }
  
  try {
    await api.post('/categories', { name: newCategoryName.value });
    toast.success('Category created successfully');
    newCategoryName.value = '';
    await fetchCategories();
  } catch (err) {
    console.error('Create category error:', err);
    toast.error(err.response?.data?.message || 'Failed to create category');
  }
};

// Delete category
const deleteCategory = async (id) => {
  if (confirm('Are you sure you want to delete this category?')) {
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted successfully');
      await fetchCategories();
    } catch (err) {
      console.error('Delete category error:', err);
      toast.error('Failed to delete category');
    }
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.categories-container {
  padding: 2rem;
  max-width: 800px;
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

h1 {
  color: #42b883;
  margin-bottom: 2rem;
}

.add-category-form {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.dark .add-category-form {
  background: #2c2c2c;
}

.add-category-form form {
  display: flex;
  gap: 1rem;
}

.add-category-form input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-add:hover:not(:disabled) {
  background: #359268;
}

.btn-add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  transition: transform 0.2s;
}

.dark .category-item {
  background: #2c2c2c;
}

.category-item:hover {
  transform: translateX(5px);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-name {
  font-size: 1.1rem;
  font-weight: 500;
}

.category-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  background: #e0e0e0;
  color: #666;
}

.dark .category-badge {
  background: #444;
  color: #ccc;
}

.system-badge {
  background: #42b883;
  color: white;
}

.delete-btn {
  padding: 0.5rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.delete-btn:hover {
  background: #c0392b;
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}
</style>