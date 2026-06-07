<template>
  <form @submit.prevent="submit">
    <input v-model="title" placeholder="Title" required />
    <textarea v-model="description" placeholder="Description"></textarea>
    <input type="date" v-model="due_date" />
    <select v-model="priority">
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
    <button type="submit">Add Task</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useTaskStore } from '../stores/tasks'
import { useToast } from 'vue-toastification'

const taskStore = useTaskStore()
const toast = useToast()
const emit = defineEmits(['task-created'])

const title = ref('')
const description = ref('')
const due_date = ref('')
const priority = ref('medium')

const submit = async () => {
  try {
    await taskStore.createTask({
      title: title.value,
      description: description.value,
      due_date: due_date.value || null,
      priority: priority.value
    })
    toast.success('Task created')
    title.value = ''
    description.value = ''
    due_date.value = ''
    priority.value = 'medium'
    emit('task-created')
  } catch (err) {
    toast.error('Failed to create task')
  }
}
</script>