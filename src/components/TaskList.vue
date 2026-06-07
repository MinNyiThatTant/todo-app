<template>
  <div class="task-list">
    <div v-for="task in tasks" :key="task.id" class="task-card">
      <h3>{{ task.title }}</h3>
      <p>{{ task.description }}</p>
      <small>Due: {{ task.due_date }} | Priority: {{ task.priority }} | Status: {{ task.status }}</small>
      <div>
        <button @click="toggleStatus(task)">Mark {{ task.status === 'completed' ? 'pending' : 'complete' }}</button>
        <button @click="deleteTask(task.id)">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTaskStore } from '../stores/tasks'
import { useToast } from 'vue-toastification'

const props = defineProps(['tasks'])
const taskStore = useTaskStore()
const toast = useToast()
const emit = defineEmits(['task-updated', 'task-deleted'])

const toggleStatus = async (task) => {
  const newStatus = task.status === 'completed' ? 'pending' : 'completed'
  await taskStore.updateTask(task.id, { ...task, status: newStatus })
  toast.success('Status updated')
  emit('task-updated')
}

const deleteTask = async (id) => {
  await taskStore.deleteTask(id)
  toast.success('Task deleted')
  emit('task-deleted')
}
</script>