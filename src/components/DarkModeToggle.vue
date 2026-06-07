<template>
  <button @click="toggleDarkMode" class="dark-mode-btn">
    {{ isDark ? '☀️ Light' : '🌙 Dark' }}
  </button>
</template>

<script setup>
import { useThemeStore } from '../stores/theme'
import { storeToRefs } from 'pinia'

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const toggleDarkMode = () => {
  themeStore.toggleDarkMode()
}
</script>

<style scoped>
.dark-mode-btn {
  background: #2c3e50;
  margin-left: auto;
}

.dark .dark-mode-btn {
  background: #42b883;
}
</style>