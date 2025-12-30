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
  <q-page class="dashboard-full">
    <!-- Hero Header -->
    <section class="dashboard-hero">
      <div class="wrap-dashboard">
        <div class="hero-content">
          <h1 class="dashboard-title">📊 Dashboard de Estadísticas</h1>
          <p class="dashboard-subtitle">Análisis completo de denuncias de violencia en Bolivia</p>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="loading" class="wrap-dashboard q-py-xl text-center">
      <q-spinner-dots color="primary" size="70px" />
      <p class="loading-message">Cargando dashboard...</p>
    </div>

    <div v-else class="wrap-dashboard dashboard-container">
      <!-- Filters Bar (Sticky) -->
      <div class="filters-bar">
        <div class="filters-header">
          <h3 class="filters-title">🔍 Filtros</h3>
          <div class="filters-actions">
            <q-btn 
              flat 
              dense 
              icon="refresh" 
              label="Limpiar" 
              @click="clearFilters"
              class="clear-btn"
            />
            <q-btn 
              unelevated 
              icon="download" 
              label="Exportar CSV" 
              @click="exportToCSV"
              color="primary"
              class="export-btn"
            />
          </div>
        </div>

        <div class="filters-grid">
          <!-- Year Filter -->
          <div class="filter-item">
            <label class="filter-label">Año</label>
            <q-select
              v-model="filters.year"
              :options="availableYears"
              outlined
              dense
              clearable
              placeholder="Todos los años"
              class="filter-select"
            />
          </div>

          <!-- Department Filter -->
          <div class="filter-item">
            <label class="filter-label">Departamento</label>
            <q-select
              v-model="filters.departments"
              :options="availableDepartments"
              outlined
              dense
              multiple
              clearable
              use-chips
              placeholder="Todos"
              class="filter-select"
            />
          </div>

          <!-- Violence Type Filter -->
          <div class="filter-item">
            <label class="filter-label">Tipo de Violencia</label>
            <q-select
             v-model="filters.violenceTypes"
              :options="availableViolenceTypes"
              outlined
              dense
              multiple
              clearable
              use-chips
              placeholder="Todos"
              class="filter-select"
            />
          </div>

          <!-- Date Range Filter -->
          <div class="filter-item filter-item-wide">
            <label class="filter-label">Rango de Fechas</label>
           <div class="date-range-inputs">
              <q-input
                v-model="filters.dateFrom"
                outlined
                dense
                type="date"
                placeholder="Desde"
                class="filter-select"
              />
              <span class="date-separator">—</span>
              <q-input
                v-model="filters.dateTo"
                outlined
                dense
                type="date"
                placeholder="Hasta"
                class="filter-select"
              />
            </div>
          </div>
        </div>

        <!-- Active Filters Badges -->
        <div v-if="hasActiveFilters" class="active-filters">
          <span class="active-filter-label">Filtros activos:</span>
          <q-chip v-if="filters.year" removable @remove="filters.year = null" color="primary" text-color="white">
            Año: {{ filters.year }}
          </q-chip>
          <q-chip 
            v-for="dept in filters.departments" 
            :key="dept" 
            removable 
            @remove="removeFilter('departments', dept)" 
            color="primary" 
            text-color="white"
          >
            {{ dept }}
          </q-chip>
          <q-chip 
            v-for="type in filters.violenceTypes" 
            :key="type" 
            removable 
            @remove="removeFilter('violenceTypes', type)" 
            color="primary" 
            text-color="white"
          >
            {{ type }}
          </q-chip>
        </div>
      </div>

      <!-- KPIs Panel -->
      <div class="kpis-panel">
        <div v-for="(kpi, index) in filteredKPIs" :key="index" class="kpi-box" :style="{ animationDelay: (index * 0.08) + 's' }">
          <div class="kpi-box-header">
            <div class="kpi-box-icon">{{ kpi.icon }}</div>
          </div>
          <div class="kpi-box-value">{{ kpi.value }}</div>
          <div class="kpi-box-label">{{ kpi.label }}</div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <!-- Trend Chart -->
        <div v-if="filteredYearlyTrend.length >= 1" class="chart-box chart-span-2">
          <h3 class="chart-box-title">📈 Tendencia Anual</h3>
          <div class="chart-box-content">
            <canvas ref="trendChart"></canvas>
          </div>
        </div>

        <!-- Monthly Trend -->
        <div v-if="filteredMonthlyTrend.length >= 1" class="chart-box chart-span-2">
          <h3 class="chart-box-title">📅 Tendencia Mensual</h3>
          <div class="chart-box-content">
            <canvas ref="monthlyTrendChart"></canvas>
          </div>
        </div>

        <!-- Typology Donut -->
        <div v-if="filteredTipologia.length > 0" class="chart-box">
          <h3 class="chart-box-title">⚠️ Tipología de Violencia</h3>
          <div class="chart-box-content chart-donut">
            <canvas ref="tipologiaChart"></canvas>
          </div>
        </div>

        <!-- Departments -->
        <div v-if="filteredDepartamentos.length > 0" class="chart-box">
          <h3 class="chart-box-title">🗺️ Por Departamento</h3>
          <div class="chart-box-content">
            <canvas ref="departamentosChart"></canvas>
          </div>
        </div>

        <!-- Municipios -->
        <div v-if="filteredMunicipios.length > 0" class="chart-box chart-span-2">
          <h3 class="chart-box-title">🏘️ Top 15 Municipios</h3>
          <div class="chart-box-content">
            <canvas ref="municipiosChart"></canvas>
          </div>
        </div>

        <!-- Age Distribution -->
        <div v-if="filteredEdades.length > 0" class="chart-box">
          <h3 class="chart-box-title">👥 Distribución por Edad</h3>
          <div class="chart-box-content">
            <canvas ref="edadesChart"></canvas>
          </div>
        </div>

        <!-- Gender -->
        <div v-if="filteredGeneros.length > 0" class="chart-box">
          <h3 class="chart-box-title">⚧ Género de Denunciados</h3>
          <div class="chart-box-content chart-donut">
            <canvas ref="generosChart"></canvas>
          </div>
        </div>

        <!-- Relations -->
        <div v-if="filteredRelaciones.length > 0" class="chart-box chart-span-2">
          <h3 class="chart-box-title">👨‍👩‍👧‍👦 Relación con Agresor</h3>
          <div class="chart-box-content">
            <canvas ref="relacionesChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { api } from '../boot/axios'
import Chart from 'chart.js/auto'

const loading = ref(true)
const statistics = ref([])

// Filters
const filters = ref({
  year: null,
  departments: [],
  violenceTypes: [],
  dateFrom: null,
  dateTo: null
})

// Chart refs
const trendChart = ref(null)
const monthlyTrendChart = ref(null)
const tipologiaChart = ref(null)
const departamentosChart = ref(null)
const municipiosChart = ref(null)
const edadesChart = ref(null)
const relacionesChart = ref(null)
const generosChart = ref(null)

// Chart instances
let charts = {}

// Color palette
const chartColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#E74C3C', '#3498DB', '#9B59B6', '#F39C12'
]

// Computed: Available filter options
const availableYears = computed(() => {
  const years = statistics.value
    .filter(s => s.category === 'Casos por Año')
    .map(s => s.period)
    .sort((a, b) => b.localeCompare(a))
  return years
})

const availableDepartments = computed(() => {
  return statistics.value
    .filter(s => s.category === 'Por Departamento')
    .map(s => s.label)
    .sort()
})

const availableViolenceTypes = computed(() => {
  return statistics.value
    .filter(s => s.category === 'Tipología Principal')
    .map(s => s.label)
    .sort()
})

const hasActiveFilters = computed(() => {
  return filters.value.year !== null ||
    filters.value.departments.length > 0 ||
    filters.value.violenceTypes.length > 0 ||
    filters.value.dateFrom !== null ||
    filters.value.dateTo !== null
})

// Computed: Filtered data (simplified - in real scenario, this would filter from raw data)
const filteredStatistics = computed(() => {
  // For now, return all statistics since actual filtering would need raw complaint data
  // In a real implementation, you'd filter the raw complaints first, then recalculate stats
  return statistics.value
})

const totalDenuncias = computed(() => {
  const total = filteredStatistics.value.find(s => 
    s.category === 'General' && s.label === 'Total Casos'
  )
  return total ? total.value : 0
})

const filteredYearlyTrend = computed(() => {
  let data = filteredStatistics.value.filter(s => s.category === 'Casos por Año')
  if (filters.value.year) {
    data = data.filter(s => s.period === filters.value.year)
  }
  return data.sort((a, b) => a.period.localeCompare(b.period))
})

const filteredMonthlyTrend = computed(() => {
  return filteredStatistics.value
    .filter(s => s.category === 'Tendencia Mensual')
    .sort((a, b) => a.period.localeCompare(b.period))
})

const filteredTipologia = computed(() => {
  let data = filteredStatistics.value.filter(s => s.category === 'Tipología Principal')
  if (filters.value.violenceTypes.length > 0) {
    data = data.filter(s => filters.value.violenceTypes.includes(s.label))
  }
  return data.sort((a, b) => b.value - a.value)
})

const filteredDepartamentos = computed(() => {
  let data = filteredStatistics.value.filter(s => s.category === 'Por Departamento')
  if (filters.value.departments.length > 0) {
    data = data.filter(s => filters.value.departments.includes(s.label))
  }
  return data.sort((a, b) => b.value - a.value)
})

const filteredMunicipios = computed(() => {
  return filteredStatistics.value
    .filter(s => s.category === 'Top Municipios')
    .sort((a, b) => b.value - a.value)
    .slice(0, 15)
})

const filteredEdades = computed(() => {
  return filteredStatistics.value.filter(s => s.category === 'Edad Víctima')
})

const filteredGeneros = computed(() => {
  return filteredStatistics.value.filter(s => s.category === 'Género Agresor')
})

const filteredRelaciones = computed(() => {
  return filteredStatistics.value
    .filter(s => s.category === 'Relación Agresor')
    .sort((a, b) => b.value - a.value)
})

const filteredKPIs = computed(() => {
  const kpis = []
  
  // Total
  kpis.push({
    icon: '📊',
    value: totalDenuncias.value.toLocaleString(),
    label: 'Total Denuncias'
  })
  
  // Current year
  const currentYear = new Date().getFullYear().toString()
  const yearData = filteredYearlyTrend.value.find(s => s.period === currentYear)
  if (yearData) {
    kpis.push({
      icon: '📅',
      value: yearData.value.toLocaleString(),
      label: `Denuncias ${currentYear}`
    })
  }
  
  // Top department
  if (filteredDepartamentos.value.length > 0) {
    kpis.push({
      icon: '🗺️',
      value: filteredDepartamentos.value[0].label,
      label: 'Departamento Principal'
    })
  }
  
  // Top violence type
  if (filteredTipologia.value.length > 0) {
    kpis.push({
      icon: '⚠️',
      value: filteredTipologia.value[0].label,
      label: 'Tipo Principal'
    })
  }
  
  // Months registered
  if (filteredMonthlyTrend.value.length > 0) {
    kpis.push({
      icon: '📈',
      value: filteredMonthlyTrend.value.length.toString(),
      label: 'Meses con Registro'
    })
  }
  
  // Average per year
  if (filteredYearlyTrend.value.length > 0) {
    const avg = Math.round(
      filteredYearlyTrend.value.reduce((sum, s) => sum + s.value, 0) / 
      filteredYearlyTrend.value.length
    )
    kpis.push({
      icon: '⚖️',
      value: avg.toLocaleString(),
      label: 'Promedio Anual'
    })
  }
  
  return kpis
})

function clearFilters() {
  filters.value = {
    year: null,
    departments: [],
    violenceTypes: [],
    dateFrom: null,
    dateTo: null
  }
}

function removeFilter(type, value) {
  const index = filters.value[type].indexOf(value)
  if (index > -1) {
    filters.value[type].splice(index, 1)
  }
}

function exportToCSV() {
  // Create CSV content
  let csv = 'Categoría,Etiqueta,Valor,Periodo\n'
  filteredStatistics.value.forEach(stat => {
    csv += `"${stat.category}","${stat.label}",${stat.value},"${stat.period || ''}"\n`
  })
  
  // Create download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `estadisticas_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function createCharts() {
  // Destroy existing charts
  Object.values(charts).forEach(chart => chart?.destroy())
  charts = {}

  // 1. Trend Chart (Bar)
  if (trendChart.value && filteredYearlyTrend.value.length >= 1) {
    charts.trend = new Chart(trendChart.value, {
      type: 'bar',
      data: {
        labels: filteredYearlyTrend.value.map(s => s.period),
        datasets: [{
          label: 'Denuncias',
          data: filteredYearlyTrend.value.map(s => s.value),
          backgroundColor: '#667eea',
          borderRadius: 8,
          barThickness: 50
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            padding: 14,
            titleFont: { size: 15, weight: 'bold' },
            bodyFont: { size: 14 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: { font: { size: 12 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 12, weight: '600' } }
          }
        }
      }
    })
  }

  // 2. Monthly Trend (Line)
  if (monthlyTrendChart.value && filteredMonthlyTrend.value.length >= 1) {
    charts.monthlyTrend = new Chart(monthlyTrendChart.value, {
      type: 'line',
      data: {
        labels: filteredMonthlyTrend.value.map(s => s.period),
        datasets: [{
          label: 'Denuncias',
          data: filteredMonthlyTrend.value.map(s => s.value),
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          x: {
            grid: { display: false },
            ticks: { maxRotation: 45, minRotation: 45, font: { size: 10 } }
          }
        }
      }
    })
  }

  // 3. Typology (Doughnut)
  if (tipologiaChart.value && filteredTipologia.value.length > 0) {
    charts.tipologia = new Chart(tipologiaChart.value, {
      type: 'doughnut',
      data: {
        labels: filteredTipologia.value.map(s => s.label),
        datasets: [{
          data: filteredTipologia.value.map(s => s.value),
          backgroundColor: chartColors,
          borderWidth: 0,
          hoverOffset: 12
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 15, font: { size: 11 } } }
        }
      }
    })
  }

  // 4. Departments (Horizontal Bar)
  if (departamentosChart.value && filteredDepartamentos.value.length > 0) {
    charts.departamentos = new Chart(departamentosChart.value, {
      type: 'bar',
      data: {
        labels: filteredDepartamentos.value.map(s => s.label),
        datasets: [{
          label: 'Denuncias',
          data: filteredDepartamentos.value.map(s => s.value),
          backgroundColor: '#36A2EB',
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
          y: { grid: { display: false } }
        }
      }
    })
  }

  // 5. Municipios (Bar)
  if (municipiosChart.value && filteredMunicipios.value.length > 0) {
    charts.municipios = new Chart(municipiosChart.value, {
      type: 'bar',
      data: {
        labels: filteredMunicipios.value.map(s => s.label),
        datasets: [{
          label: 'Denuncias',
          data: filteredMunicipios.value.map(s => s.value),
          backgroundColor: '#FFCE56',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true },
          x: { ticks: { maxRotation: 45, minRotation: 45, font: { size: 10 } } }
        }
      }
    })
  }

  // 6. Ages (Pie)
  if (edadesChart.value && filteredEdades.value.length > 0) {
    charts.edades = new Chart(edadesChart.value, {
      type: 'pie',
      data: {
        labels: filteredEdades.value.map(s => s.label),
        datasets: [{
          data: filteredEdades.value.map(s => s.value),
          backgroundColor: chartColors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { padding: 12 } } }
      }
    })
  }

  // 7. Gender (Doughnut)
  if (generosChart.value && filteredGeneros.value.length > 0) {
    charts.generos = new Chart(generosChart.value, {
      type: 'doughnut',
      data: {
        labels: filteredGeneros.value.map(s => s.label),
        datasets: [{
          data: filteredGeneros.value.map(s => s.value),
          backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: { legend: { position: 'bottom' } }
      }
    })
  }

  // 8. Relations (Horizontal Bar)
  if (relacionesChart.value && filteredRelaciones.value.length > 0) {
    charts.relaciones = new Chart(relacionesChart.value, {
      type: 'bar',
      data: {
        labels: filteredRelaciones.value.map(s => s.label),
        datasets: [{
          label: 'Casos',
          data: filteredRelaciones.value.map(s => s.value),
          backgroundColor: '#4BC0C0',
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    })
  }
}

async function fetchStatistics() {
  try {
    loading.value = true
    const response = await api.get('/complaints/statistics')
    statistics.value = response.data
    // Don't create charts here - let the watch handle it after DOM updates
  } catch (error) {
    console.error('Error fetching stats:', error)
  } finally {
    loading.value = false
  }
}

// Watch statistics data and recreate charts when it changes
watch(statistics, async () => {
  if (statistics.value.length > 0) {
    // Wait for DOM to update with v-if conditions
    await nextTick()
    // Wait one more tick to ensure canvas elements are rendered
    await nextTick()
    createCharts()
  }
}, { immediate: false })

// Watch filters and recreate charts
watch(() => [filters.value.year, filters.value.departments, filters.value.violenceTypes], async () => {
  await nextTick()
  await nextTick()
  createCharts()
}, { deep: true })

onMounted(fetchStatistics)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

.dashboard-full {
  background: #f5f7fa;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding-bottom: 60px;
}

/* Hero Header */
.dashboard-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 0 50px;
  position: relative;
  overflow: hidden;
}

.dashboard-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.dashboard-title {
  font-size: 3rem;
  font-weight: 900;
  margin: 0 0 16px;
  letter-spacing: -0.02em;
  animation: fadeInUp 0.6s ease-out;
}

.dashboard-subtitle {
  font-size: 1.25rem;
  opacity: 0.95;
  margin: 0;
  font-weight: 500;
  animation: fadeInUp 0.6s ease-out 0.1s both;
}

.wrap-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.dashboard-container {
  margin-top: -30px;
  position: relative;
  z-index: 10;
}

.loading-message {
  font-size: 1.15rem;
  color: #64748b;
  margin-top: 16px;
}

/* Filters Bar */
.filters-bar {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 32px;
  border: 1px solid #e2e8f0;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.filters-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.filter-item-wide {
  grid-column: span 2;
}
@media (max-width: 768px) {
  .filter-item-wide {
    grid-column: span 1;
  }
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.date-range-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-separator {
  color: #94a3b8;
  font-weight: bold;
}

.active-filters {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.active-filter-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

/* KPIs Panel */

.kpis-panel {
  display: grid;
  grid-template-columns: repeat(6, 1fr); /* Force 6 in a row */
  gap: 16px; /* Reduced gap */
  margin-bottom: 32px;
}

@media (max-width: 1200px) {
  .kpis-panel {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .kpis-panel {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .kpis-panel {
    grid-template-columns: 1fr;
  }
}

.kpi-box {
  background: white;
  border-radius: 12px; /* Slightly reduced radius */
  padding: 16px; /* Reduced padding */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: fadeInUp 0.5s ease-out backwards;
}

.kpi-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 12px -3px rgba(0, 0, 0, 0.1);
}

.kpi-box-header {
  margin-bottom: 8px; /* Reduced margin */
}

.kpi-box-icon {
  font-size: 1.75rem; /* Reduced from 2.5rem */
}

.kpi-box-value {
  font-size: 1.5rem; /* Reduced from 2rem */
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
}

.kpi-box-label {
  font-size: 0.75rem; /* Reduced from 0.875rem */
  color: #64748b;
  font-weight: 600;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* Charts Grid */
/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  grid-auto-flow: dense; /* Fill holes automatically */
}

.chart-box {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  grid-column: span 6; /* Default: 2 columns on medium screens */
  display: flex;
  flex-direction: column;
}

/* Explicit spans for larger screens */
.chart-span-2 {
  grid-column: span 8; 
}

/* Helper for single column spans */
.chart-span-1 {
  grid-column: span 4;
}

@media (min-width: 1200px) {
  /* On large screens, 8 + 4 = 12 columns */
  .chart-span-2 {
    grid-column: span 8; 
  }
  /* Items not marked as large get 4 columns (1/3 width) */
  .chart-box:not(.chart-span-2) {
    grid-column: span 4;
  }
}

@media (max-width: 1200px) and (min-width: 768px) {
  /* On medium screens, force 2 columns structure (6+6) */
  .chart-span-2, 
  .chart-box:not(.chart-span-2) {
    grid-column: span 6;
  }
}

@media (max-width: 768px) {
  .chart-box, .chart-span-2 {
     grid-column: span 12; /* Stack on mobile */
  }
}

.chart-box-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-box-content {
  position: relative;
  height: 300px;
  width: 100%;
}

.chart-donut {
  height: 250px;
}

/* Keyframes */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
