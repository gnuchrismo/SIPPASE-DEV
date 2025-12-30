<!--
  Proyecto: PORTAL SIPPASE - ROBITCMS
  Autor: Christian Mollo
  Contacto: gnuchrismo@gmail.com | LinkedIn: https://www.linkedin.com/in/gnuchrismo/?locale=es_ES
  Patrocinado por: UNWOMEN - Especialista en Desarrollo de Sistemas SIPPASE, Nov - Dic 2025

  Licencia: PROPIETARIA - Uso exclusivo autorizado para la entidad beneficiaria.
  Queda prohibida la copia, distribución, modificación o uso no autorizado.

  Advertencia: Algunas partes de este proyecto utilizan librerías o frameworks
  de terceros bajo licencias propias (por ejemplo Quasar Framework - MIT License).
  Se debe cumplir con todas las licencias externas involucradas.

  © 2025 Desarrollado por Christian Mollo - UNWOMEN - Especialista en Desarrollo de Sistemas SIPPASE, Nov - Dic 2025, Todos los derechos reservados.
-->
<template>
  <q-page padding>
    <h1 class="text-h4 q-mb-md">Dashboard</h1>
    <p>Bienvenido al panel de administración del SIPPASE.</p>
    
    <!-- Stats Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="text-h6">Sliders Activos</div>
            <div class="text-h3">{{ stats.sliders }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-secondary text-white">
          <q-card-section>
            <div class="text-h6">Sistemas</div>
            <div class="text-h3">{{ stats.systems }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-accent text-white">
          <q-card-section>
            <div class="text-h6">Documentos</div>
            <div class="text-h3">{{ stats.documents }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-info text-white">
          <q-card-section>
            <div class="text-h6">Mensajes</div>
            <div class="text-h3">{{ stats.messages }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts and Activity -->
    <div class="row q-col-gutter-md">
      <!-- Activity Chart -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6">Actividad de los Últimos 30 Días</div>
          </q-card-section>
          <q-card-section>
            <Line v-if="chartData.labels.length > 0" :data="chartData" :options="chartOptions" />
            <div v-else class="text-center text-grey-6 q-pa-md">No hay datos disponibles</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Activity -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Actividad Reciente</div>
          </q-card-section>
          <q-card-section>
            <q-list separator>
              <q-item v-for="item in recentActivity" :key="item.id" dense>
                <q-item-section avatar>
                  <q-icon :name="getActivityIcon(item.type)" :color="getActivityColor(item.type)" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.name }}</q-item-label>
                  <q-item-label caption>{{ formatActivityType(item.type) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption>{{ formatDate(item.created_at) }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="recentActivity.length === 0">
                <q-item-section>
                  <q-item-label class="text-grey-6">No hay actividad reciente</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../../boot/axios'
import { useQuasar } from 'quasar'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const $q = useQuasar()
const stats = ref({
  sliders: 0,
  systems: 0,
  documents: 0,
  users: 0,
  messages: 0
})
const recentActivity = ref([])
const chartData = ref({
  labels: [],
  datasets: []
})

// Ensure options are reactive and safe
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
})

const loading = ref(false)

async function fetchDashboardData() {
  loading.value = true
  try {
    // Fetch stats
    const statsRes = await api.get('/dashboard/stats')
    stats.value = statsRes.data

    // Fetch activity
    const activityRes = await api.get('/dashboard/activity')
    recentActivity.value = activityRes.data

    // Fetch chart data
    const chartRes = await api.get('/dashboard/chart-data')
    prepareChartData(chartRes.data)

  } catch (error) {
    // Handle authentication errors silently since the axios interceptor
    // already handles session expiration and redirects to login
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error('Error fetching dashboard data', error)
    }
    // Silently handle error - dashboard will show empty state
  } finally {
    loading.value = false
  }
}

function prepareChartData(data) {
  if (!data || !data.documents || !data.messages) {
    console.warn('Invalid chart data received');
    return;
  }

  // Create a map of dates for the last 30 days
  const days = 30
  const dateMap = new Map()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    dateMap.set(dateStr, { documents: 0, messages: 0 })
  }

  // Fill in the data
  data.documents.forEach(item => {
    const dateStr = item.date.split('T')[0]
    if (dateMap.has(dateStr)) {
      dateMap.get(dateStr).documents = parseInt(item.count)
    }
  })

  data.messages.forEach(item => {
    const dateStr = item.date.split('T')[0]
    if (dateMap.has(dateStr)) {
      dateMap.get(dateStr).messages = parseInt(item.count)
    }
  })

  // Convert to chart format
  const labels = []
  const documentsData = []
  const messagesData = []

  dateMap.forEach((value, key) => {
    labels.push(new Date(key).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }))
    documentsData.push(value.documents)
    messagesData.push(value.messages)
  })

  chartData.value = {
    labels,
    datasets: [
      {
        label: 'Documentos',
        data: documentsData,
        borderColor: '#1976D2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.4
      },
      {
        label: 'Mensajes',
        data: messagesData,
        borderColor: '#9C27B0',
        backgroundColor: 'rgba(156, 39, 176, 0.1)',
        tension: 0.4
      }
    ]
  }
}

function getActivityIcon(type) {
  const icons = {
    slider: 'collections',
    system: 'apps',
    document: 'description',
    user: 'person',
    message: 'mail'
  }
  return icons[type] || 'circle'
}

function getActivityColor(type) {
  const colors = {
    slider: 'primary',
    system: 'secondary',
    document: 'accent',
    user: 'positive',
    message: 'info'
  }
  return colors[type] || 'grey'
}

function formatActivityType(type) {
  const types = {
    slider: 'Slider',
    system: 'Sistema',
    document: 'Documento',
    user: 'Usuario',
    message: 'Mensaje'
  }
  return types[type] || type
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `Hace ${days}d`
  if (hours > 0) return `Hace ${hours}h`
  if (minutes > 0) return `Hace ${minutes}m`
  return 'Ahora'
}

onMounted(fetchDashboardData)
</script>
