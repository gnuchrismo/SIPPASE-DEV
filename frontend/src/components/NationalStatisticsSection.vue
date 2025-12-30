<template>
  <section :id="sectionId" class="stats-section-modern section-padding">
    <div class="wrap-container">
      <!-- Section Header -->
      <div class="section-header text-center q-mb-xl">
        <h2 class="section-title" :style="{ color: titleColor }">{{ title }}</h2>
        <p class="section-subtitle">{{ subtitle }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-py-lg">
        <q-spinner-dots size="50px" color="primary" />
      </div>

      <div v-else class="stats-content">
        <!-- Filter Row -->
        <div class="filters-container q-mb-xl row q-col-gutter-md flex-center">
            <div class="col-12 col-md-3">
                <q-select 
                    v-model="filters.year" 
                    :options="filterOptions.years" 
                    label="Gestión" 
                    outlined 
                    dense 
                    bg-color="white"
                    color="primary"
                    clearable
                    popup-content-class="filter-popup"
                >
                    <template v-slot:prepend>
                        <q-icon name="calendar_today" color="primary" />
                    </template>
                </q-select>
            </div>
            <div class="col-12 col-md-4">
                <q-select 
                    v-model="filters.violenceType" 
                    :options="filterOptions.types" 
                    label="Tipo de Violencia" 
                    outlined 
                    dense 
                    bg-color="white"
                    color="primary"
                    clearable
                    popup-content-class="filter-popup"
                >
                    <template v-slot:prepend>
                        <q-icon name="category" color="primary" />
                    </template>
                </q-select>
            </div>
        </div>

        <!-- 1. Top Cards Grid -->
        <div class="cards-grid q-mb-xl">
          <StatisticsCard 
            title="Total Nacional" 
            :value="totalStats.total" 
            subtitle="Denuncias Registradas"
            icon="assessment"
            :gradient="true"
          />
          <div class="col-12 col-md-6 col-lg-3">
            <StatisticsCard 
              :title="totalStats.yearLabel" 
              :value="totalStats.currentYear" 
              subtitle="Denuncias este año"
              icon="event"
            />
          </div>
          <div class="col-12 col-md-6 col-lg-3">
            <StatisticsCard 
              title="Mayor Incidencia" 
              :value="totalStats.maxDeptName" 
              :subtitle="totalStats.maxDeptValue ? `${totalStats.maxDeptValue} casos` : 'Departamento con más casos'"
              :meta="totalStats.maxDeptMetaLabel ? `Mayormente: ${totalStats.maxDeptMetaLabel} (${totalStats.maxDeptMetaValue})` : ''"
              icon="map"
            />
          </div>
          <div class="col-12 col-md-6 col-lg-3">
            <StatisticsCard 
              title="Violencia Frecuente" 
              :value="totalStats.topType" 
              :subtitle="totalStats.topTypeValue ? `${totalStats.topTypeValue} casos` : 'Tipología principal'"
              :meta="totalStats.topTypeMetaLabel ? `Más frecuente en: ${totalStats.topTypeMetaLabel}` : ''"
              icon="warning"
            />
          </div>
        </div>

    
    <!-- Main Content Grid -->
    <div class="row q-col-gutter-lg" v-if="totalStats.totalValue > 0">
      <!-- Left Column: Map -->
      <div class="col-12 col-lg-8">
        <div class="stat-card-container h-100">
            <h3 class="text-h6 q-mb-md text-weight-bold text-primary-dark">Mapa de Incidencia</h3>
            <p class="text-caption text-grey-7 q-mb-lg">Explora los datos por departamento</p>
            
            <BoliviaMap 
              :data="departmentData"
              v-model="selectedDept"
              class="q-mb-md"
            />
        </div>
      </div>

      <!-- Right Column: Charts -->
      <div class="col-12 col-lg-4 column q-gutter-y-lg">
        <!-- Top Violence Types -->
        <div class="stat-card-container col-auto">
            <h3 class="text-h6 q-mb-md text-weight-bold text-primary-dark">Tipos de Violencia</h3>
            
            <div class="types-list custom-scroll">
              <div v-for="type in topTypes.slice(0,5)" :key="type.label" class="type-item q-mb-sm">
                <div class="row justify-between items-center q-mb-xs">
                  <span class="text-body2 text-grey-9">{{ type.label }}</span>
                  <span class="text-weight-bold">{{ type.value }}</span>
                </div>
                <q-linear-progress 
                  :value="type.value / maxTypeValue" 
                  class="rounded-borders"
                  :color="getColor(type.label)"
                  track-color="grey-2"
                  size="6px"
                />
              </div>
            </div>
        </div>

        <!-- Annual Trend -->
        <div class="stat-card-container col-grow">
            <h3 class="text-h6 q-mb-md text-weight-bold text-primary-dark">Tendencia Anual</h3>
            <div class="chart-wrapper" v-if="yearChartData && yearChartData.labels && yearChartData.labels.length > 0">
               <Bar :data="yearChartData" :options="chartOptions" />
            </div>
            <div v-else class="flex flex-center h-100 text-grey-5">
               No hay suficientes datos para tendencia
            </div>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="row justify-center q-pa-xl">
        <div class="text-center text-grey-6">
            <q-icon name="search_off" size="64px" class="q-mb-sm"/>
            <div class="text-h6">No hay datos para la selección actual</div>
        </div>
    </div>


        <div class="text-center q-mt-xl">
            <q-btn 
                to="/estadisticas" 
                color="primary" 
                label="Ver Dashboard Completo" 
                icon-right="arrow_forward" 
                rounded 
                push 
                size="lg"
                class="cta-btn"
            />
        </div>
      </div>
    </div>

    <!-- Sidebar Integration -->
    <DepartmentSidebar 
      v-model="sidebarOpen"
      :department="selectedDeptData"
    />

  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { api } from 'src/boot/axios'
import Chart from 'chart.js/auto'
import StatisticsCard from 'src/components/statistics/StatisticsCard.vue'
import BoliviaMap from 'src/components/statistics/BoliviaMap.vue'
import DepartmentSidebar from 'src/components/statistics/DepartmentSidebar.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Estadísticas Nacionales'
  },
  subtitle: {
    type: String,
    default: 'Datos consolidados de violencia en Bolivia, actualizados en tiempo real.'
  },
  titleColor: {
    type: String,
    default: '#111827'
  },
  sectionId: {
    type: String,
    default: 'estadisticas-nacionales'
  }
})

const loading = ref(true)
const statistics = ref([])
const selectedDept = ref(null)
const sidebarOpen = ref(false)
const trendChartRef = ref(null)
let trendChartInstance = null

// Filters
const filters = ref({ year: null, violenceType: null })
const filterOptions = ref({ years: [], types: [] })

watch(selectedDept, (val) => {
    if(val) sidebarOpen.value = true
})

// Update data when filters change
watch(filters, () => {
    fetchData()
}, { deep: true })

async function fetchData() {
    loading.value = true
    try {
        const params = {}
        if(filters.value.year) params.year = filters.value.year
        if(filters.value.violenceType) params.violence_type = filters.value.violenceType

        const res = await api.get('/complaints/statistics', { params })
        statistics.value = res.data

        // Populate options only on first load (when options are empty)
        // Note: We populate types from the full list if possible.
        // But if we filter by year, the types might change? 
        // Better to populate options once from a separate call or check if empty.
        // Ideally, filters options should remain constant unless we want cascading filters.
        // Let's keep them constant based on initial load.
        if (filterOptions.value.years.length === 0) {
             const years = statistics.value
                .filter(s => s.category === 'Casos por Año')
                .map(s => s.label)
                .sort((a,b) => b.localeCompare(a)) // Descending years
             
             const types = statistics.value
                .filter(s => s.category === 'Tipología Principal')
                .map(s => s.label)
                .sort()

             filterOptions.value = { years, types }
        }

    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

onMounted(fetchData)

// Data Computed
const totalStats = computed(() => {
    const total = statistics.value.find(s => s.category === 'General' && s.label === 'Total Casos')?.value || 0
    
    // Dynamic Year Handling
    const selectedYear = filters.value.year || '2025';
    // Find stats for the selected period. If filter is active, 'Casos por Año' might only contain that year.
    const currentYearStat = statistics.value.find(s => s.category === 'Casos por Año' && s.period == selectedYear);
    const currentYearVal = currentYearStat ? currentYearStat.value : 0;

    const dept = [...statistics.value]
        .filter(s => s.category === 'Por Departamento')
        .sort((a,b) => parseInt(b.value) - parseInt(a.value))[0]
    
    const type = [...statistics.value]
        .filter(s => s.category === 'Tipología Principal')
        .sort((a,b) => parseInt(b.value) - parseInt(a.value))[0]
    
    return {
        total: parseInt(total).toLocaleString(),
        totalValue: parseInt(total), // Raw value for checks
        yearLabel: `Gestión ${selectedYear}`,
        currentYear: currentYearVal.toLocaleString(),
        
        maxDeptName: dept ? dept.label : 'Sin datos',
        maxDeptValue: dept ? parseInt(dept.value).toLocaleString() : '',
        maxDeptMetaLabel: dept ? dept.top_meta_label : '', // e.g. "Violencia Familiar"
        maxDeptMetaValue: dept ? parseInt(dept.top_meta_value).toLocaleString() : '',

        topType: type ? type.label : 'Sin datos',
        topTypeValue: type ? parseInt(type.value).toLocaleString() : '',
        topTypeMetaLabel: type ? type.top_meta_label : '' // e.g. "Santa Cruz"
    }
})

const departmentData = computed(() => statistics.value.filter(s => s.category === 'Por Departamento'))

const topTypes = computed(() => statistics.value.filter(s => s.category === 'Tipología Principal').sort((a,b) => b.value - a.value))
const maxTypeValue = computed(() => Math.max(...topTypes.value.map(t => t.value) || [1]))

const selectedDeptData = computed(() => {
    if(!selectedDept.value) return null
    const d = departmentData.value.find(i => i.label === selectedDept.value)
    if(!d) return null
    // Mock types for sidebar
    return {
        ...d,
        types: topTypes.value.map(t => ({
             label: t.label,
             value: Math.floor(t.value * (d.value / (parseInt(totalStats.value.total.replace(/,/g,'')) || 1)))
        }))
    }
})

// Trend Chart Data
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const yearChartData = computed(() => {
    // Filter out historical or non-year categories if necessary, or just use 'Casos por Año'
    const trendStats = statistics.value
        .filter(s => s.category === 'Casos por Año')
        .sort((a,b) => a.period.localeCompare(b.period))
    
    // If we only have filtered data (e.g. only 2025), we still show it.
    
    return {
        labels: trendStats.map(s => s.period),
        datasets: [{
            label: 'Casos Registrados',
            data: trendStats.map(s => s.value),
            backgroundColor: '#4F46E5',
            borderRadius: 6,
            barThickness: 24
        }]
    }
})

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#1E293B',
            padding: 12,
            titleFont: { size: 13 },
            bodyFont: { size: 14, weight: 'bold' },
            cornerRadius: 8,
            displayColors: false
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: '#F1F5F9',
                borderDash: [4, 4]
            },
            ticks: {
                font: { size: 11 },
                color: '#94A3B8'
            },
            border: { display: false }
        },
        x: {
            grid: { display: false },
            ticks: {
                font: { size: 12, weight: '500' },
                color: '#64748B'
            },
            border: { display: false }
        }
    }
}

const colors = ['#F87171', '#60A5FA', '#34D399', '#A78BFA', '#FBBF24']
const getColor = (i) => {
    // Hash string to color index if label passed
    if(typeof i === 'string') {
        let hash = 0;
        for (let j = 0; j < i.length; j++) {
            hash = i.charCodeAt(j) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }
    return colors[i % colors.length]
}

</script>

<style scoped>
.stats-section-modern {
    background: #FAFAFA;
}
.section-padding { padding: 80px 0; }
.wrap-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

.section-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: #111827;
    margin: 0 0 16px;
    letter-spacing: -0.02em;
}
.section-subtitle {
    font-size: 1.1rem;
    color: #6B7280;
    max-width: 600px;
    margin: 0 auto;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
}
@media(max-width: 1024px) { .cards-grid { grid-template-columns: repeat(2, 1fr); } }
@media(max-width: 600px) { .cards-grid { grid-template-columns: 1fr; } }

.main-layout-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
}
@media(max-width: 900px) { .main-layout-grid { grid-template-columns: 1fr; } }

.map-container-box, .chart-box {
    background: white;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    border: 1px solid rgba(0,0,0,0.03);
}

.box-header h3, .chart-box h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 4px;
    color: #1F2937;
}
.box-header p { color: #9CA3AF; margin-bottom: 20px; }

/* Types List */
.types-list { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
.type-label { font-size: 0.9rem; font-weight: 500; color: #374151; }
.type-val { font-weight: 700; color: #111827; }

.progress-track {
    height: 8px;
    background: #F3F4F6;
    border-radius: 4px;
    margin-top: 6px;
    overflow: hidden;
}
.progress-bar { height: 100%; border-radius: 4px; }

.trend-canvas-wrapper { height: 200px; width: 100%; }

.cta-btn {
    padding: 12px 32px;
    font-weight: 600;
    letter-spacing: 0.5px;
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
}
</style>
