<template>
  <div class="container">
    <h1>Reports & Analytics</h1>
    
    <!-- Date Range Filter -->
    <div class="filters">
      <div class="filter-group">
        <label>Date Range:</label>
        <select v-model="dateRange" @change="loadReports">
          <option value="all">All Time</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-icon"></div>
        <div class="summary-value">{{ stats.totalTasks }}</div>
        <div class="summary-label">Total Tasks</div>
      </div>
      <div class="summary-card">
        <div class="summary-icon"></div>
        <div class="summary-value">{{ stats.completionRate }}%</div>
        <div class="summary-label">Completion Rate</div>
      </div>
      <div class="summary-card">
        <div class="summary-icon"></div>
        <div class="summary-value">{{ stats.overdueTasks }}</div>
        <div class="summary-label">Overdue Tasks</div>
      </div>
      <div class="summary-card">
        <div class="summary-icon"></div>
        <div class="summary-value">{{ stats.productivity }}%</div>
        <div class="summary-label">Productivity</div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-card">
        <h3>Task Status Distribution</h3>
        <div class="pie-chart">
          <svg viewBox="0 0 200 200" width="200" height="200">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#e0e0e0" stroke-width="40"/>
            <circle 
              cx="100" cy="100" r="80" fill="none" 
              :stroke-dasharray="getStatusDashArray('completed')"
              :stroke-dashoffset="getStatusDashOffset('completed')"
              stroke="#27ae60" stroke-width="40" transform="rotate(-90 100 100)"
            />
            <circle 
              cx="100" cy="100" r="80" fill="none" 
              :stroke-dasharray="getStatusDashArray('in_progress')"
              :stroke-dashoffset="getStatusDashOffset('in_progress')"
              stroke="#3498db" stroke-width="40" transform="rotate(-90 100 100)"
            />
            <circle 
              cx="100" cy="100" r="80" fill="none" 
              :stroke-dasharray="getStatusDashArray('pending')"
              :stroke-dashoffset="getStatusDashOffset('pending')"
              stroke="#f39c12" stroke-width="40" transform="rotate(-90 100 100)"
            />
            <text x="100" y="100" text-anchor="middle" dy="5" font-size="24" font-weight="bold">
              {{ stats.totalTasks }}
            </text>
          </svg>
        </div>
        <div class="pie-legend">
          <div class="legend-item">
            <span class="legend-color completed"></span>
            <span>Completed ({{ statusCounts.completed }})</span>
          </div>
          <div class="legend-item">
            <span class="legend-color in_progress"></span>
            <span>In Progress ({{ statusCounts.in_progress }})</span>
          </div>
          <div class="legend-item">
            <span class="legend-color pending"></span>
            <span>Pending ({{ statusCounts.pending }})</span>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <h3>Priority Distribution</h3>
        <div class="bar-chart">
          <div class="bar-item">
            <div class="bar-label">High</div>
            <div class="bar-container">
              <div class="bar" :style="{ width: priorityPercentages.high + '%', background: '#e74c3c' }">
                {{ priorityCounts.high }}
              </div>
            </div>
          </div>
          <div class="bar-item">
            <div class="bar-label">Medium</div>
            <div class="bar-container">
              <div class="bar" :style="{ width: priorityPercentages.medium + '%', background: '#f39c12' }">
                {{ priorityCounts.medium }}
              </div>
            </div>
          </div>
          <div class="bar-item">
            <div class="bar-label">Low</div>
            <div class="bar-container">
              <div class="bar" :style="{ width: priorityPercentages.low + '%', background: '#27ae60' }">
                {{ priorityCounts.low }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Distribution -->
    <div class="category-section">
      <h3>Tasks by Category</h3>
      <div class="category-list">
        <div v-for="cat in categoryStats" :key="cat.name" class="category-item">
          <div class="category-name">{{ cat.name }}</div>
          <div class="category-bar-container">
            <div class="category-bar" :style="{ width: cat.percentage + '%' }"></div>
          </div>
          <div class="category-count">{{ cat.count }} tasks</div>
        </div>
        <div v-if="categoryStats.length === 0" class="empty-state">
          No categories yet
        </div>
      </div>
    </div>

    <!-- Weekly Activity -->
    <div class="activity-section">
      <h3>Weekly Activity</h3>
      <div class="activity-grid">
        <div v-for="day in weeklyActivity" :key="day.name" class="activity-day">
          <div class="activity-bar-container">
            <div class="activity-bar" :style="{ height: day.percentage + '%' }"></div>
          </div>
          <div class="activity-count">{{ day.count }}</div>
          <div class="activity-name">{{ day.name }}</div>
        </div>
      </div>
    </div>

    <!-- Export Button -->
    <div class="export-section">
      <button @click="exportReport" class="export-btn">
        Export Report (JSON)
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../stores/tasks'
import { useToast } from 'vue-toastification'

const taskStore = useTaskStore()
const toast = useToast()
const dateRange = ref('all')
const allTasks = ref([])

// Stats
const stats = ref({
  totalTasks: 0,
  completionRate: 0,
  overdueTasks: 0,
  productivity: 0
})

const statusCounts = ref({
  pending: 0,
  in_progress: 0,
  completed: 0
})

const priorityCounts = ref({
  high: 0,
  medium: 0,
  low: 0
})

const priorityPercentages = computed(() => {
  const total = priorityCounts.value.high + priorityCounts.value.medium + priorityCounts.value.low
  if (total === 0) return { high: 0, medium: 0, low: 0 }
  return {
    high: (priorityCounts.value.high / total) * 100,
    medium: (priorityCounts.value.medium / total) * 100,
    low: (priorityCounts.value.low / total) * 100
  }
})

const categoryStats = ref([])
const weeklyActivity = ref([])

// Filter tasks by date range
const filterByDateRange = (tasks) => {
  if (dateRange.value === 'all') return tasks
  
  const now = new Date()
  const cutoff = new Date()
  
  switch (dateRange.value) {
    case 'week':
      cutoff.setDate(now.getDate() - 7)
      break
    case 'month':
      cutoff.setDate(now.getDate() - 30)
      break
    case 'year':
      cutoff.setFullYear(now.getFullYear() - 1)
      break
  }
  
  return tasks.filter(task => new Date(task.created_at) >= cutoff)
}

// Calculate status dash array for pie chart
const getStatusDashArray = (status) => {
  const total = statusCounts.value.pending + statusCounts.value.in_progress + statusCounts.value.completed
  if (total === 0) return '0 502'
  
  let percentage = 0
  if (status === 'completed') percentage = statusCounts.value.completed / total
  else if (status === 'in_progress') percentage = statusCounts.value.in_progress / total
  else percentage = statusCounts.value.pending / total
  
  const circumference = 2 * Math.PI * 80 // 502.65
  const dashArray = percentage * circumference
  return `${dashArray} ${circumference}`
}

const getStatusDashOffset = (status) => {
  const total = statusCounts.value.pending + statusCounts.value.in_progress + statusCounts.value.completed
  if (total === 0) return 0
  
  let offset = 0
  if (status === 'in_progress') offset = statusCounts.value.completed / total
  else if (status === 'pending') offset = (statusCounts.value.completed + statusCounts.value.in_progress) / total
  else offset = 0
  
  const circumference = 2 * Math.PI * 80
  return circumference - (offset * circumference)
}

// Load reports data
const loadReports = async () => {
  try {
    await taskStore.fetchTasks()
    let tasks = [...taskStore.tasks]
    const filteredTasks = filterByDateRange(tasks)
    
    // Calculate stats
    stats.value.totalTasks = filteredTasks.length
    const completedCount = filteredTasks.filter(t => t.status === 'completed').length
    stats.value.completionRate = filteredTasks.length > 0 
      ? Math.round((completedCount / filteredTasks.length) * 100)
      : 0
      
    // Overdue tasks
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    stats.value.overdueTasks = filteredTasks.filter(t => 
      t.due_date && new Date(t.due_date) < today && t.status !== 'completed'
    ).length
    
    stats.value.productivity = Math.min(100, Math.round((completedCount / Math.max(1, filteredTasks.length)) * 100))
    
    // Status counts
    statusCounts.value.pending = filteredTasks.filter(t => t.status === 'pending').length
    statusCounts.value.in_progress = filteredTasks.filter(t => t.status === 'in_progress').length
    statusCounts.value.completed = filteredTasks.filter(t => t.status === 'completed').length
    
    // Priority counts
    priorityCounts.value.high = filteredTasks.filter(t => t.priority === 'high').length
    priorityCounts.value.medium = filteredTasks.filter(t => t.priority === 'medium').length
    priorityCounts.value.low = filteredTasks.filter(t => t.priority === 'low').length
    
    // Category statistics
    const categoryMap = new Map()
    filteredTasks.forEach(task => {
      const catName = task.category_name || 'Uncategorized'
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1)
    })
    
    categoryStats.value = Array.from(categoryMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / filteredTasks.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
    
    // Weekly activity
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const activity = new Array(7).fill(0)
    
    filteredTasks.forEach(task => {
      const date = new Date(task.created_at)
      const day = date.getDay()
      activity[day]++
    })
    
    const maxActivity = Math.max(...activity, 1)
    weeklyActivity.value = days.map((name, index) => ({
      name,
      count: activity[index],
      percentage: (activity[index] / maxActivity) * 100
    }))
    
  } catch (err) {
    toast.error('Failed to load reports')
  }
}

// Export report as JSON
const exportReport = () => {
  const report = {
    generatedAt: new Date().toISOString(),
    dateRange: dateRange.value,
    stats: stats.value,
    statusDistribution: statusCounts.value,
    priorityDistribution: priorityCounts.value,
    categoryDistribution: categoryStats.value,
    weeklyActivity: weeklyActivity.value
  }
  
  const dataStr = JSON.stringify(report, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const exportFileDefaultName = `todo-report-${new Date().toISOString().slice(0,10)}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
  
  toast.success('Report exported successfully')
}

onMounted(() => {
  loadReports()
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

.filters {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.dark .filters {
  background: #2c2c2c;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-group label {
  font-weight: 500;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  color: white;
}

.summary-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 2rem;
  font-weight: bold;
}

.summary-label {
  margin-top: 0.5rem;
  opacity: 0.9;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
}

.dark .chart-card {
  background: #2c2c2c;
}

.chart-card h3 {
  margin-bottom: 1rem;
  color: #333;
}

.dark .chart-card h3 {
  color: #f0f0f0;
}

.pie-chart {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.pie-legend {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.completed {
  background: #27ae60;
}

.legend-color.in_progress {
  background: #3498db;
}

.legend-color.pending {
  background: #f39c12;
}

.bar-chart {
  margin-top: 1rem;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.bar-label {
  width: 60px;
  font-weight: 500;
}

.bar-container {
  flex: 1;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.dark .bar-container {
  background: #444;
}

.bar {
  padding: 0.5rem;
  color: white;
  text-align: right;
  transition: width 0.5s ease;
  border-radius: 10px;
}

.category-section, .activity-section {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.dark .category-section,
.dark .activity-section {
  background: #2c2c2c;
}

.category-section h3, .activity-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.dark .category-section h3,
.dark .activity-section h3 {
  color: #f0f0f0;
}

.category-item {
  margin-bottom: 1rem;
}

.category-name {
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.category-bar-container {
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin: 0.25rem 0;
}

.dark .category-bar-container {
  background: #444;
}

.category-bar {
  height: 30px;
  background: #42b883;
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  padding-right: 10px;
  color: white;
  font-size: 0.85rem;
  border-radius: 10px;
}

.category-count {
  font-size: 0.85rem;
  color: #666;
}

.activity-grid {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  gap: 1rem;
  min-height: 200px;
}

.activity-day {
  flex: 1;
  text-align: center;
}

.activity-bar-container {
  height: 150px;
  display: flex;
  align-items: flex-end;
  margin-bottom: 0.5rem;
}

.activity-bar {
  width: 100%;
  background: #42b883;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
  min-height: 2px;
}

.activity-count {
  font-size: 0.85rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.activity-name {
  font-size: 0.8rem;
  color: #666;
}

.export-section {
  text-align: center;
}

.export-btn {
  padding: 1rem 2rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.2s;
}

.export-btn:hover {
  background: #359268;
  transform: translateY(-2px);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}
</style>