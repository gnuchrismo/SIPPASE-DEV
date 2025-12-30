<template>
  <div class="dept-sidebar" :class="{ 'is-open': modelValue }">
    <div v-if="department" class="sidebar-content">
      <!-- Header -->
      <div class="sidebar-header">
        <h2 class="dept-name">
          <q-icon name="place" class="q-mr-sm text-primary" />
          {{ department.label }}
        </h2>
        <q-btn flat round icon="close" dense @click="$emit('update:modelValue', false)" color="grey-6" />
      </div>

      <!-- Main Stat -->
      <div class="main-stat">
        <div class="stat-number">{{ department.value.toLocaleString() }}</div>
        <div class="stat-label">Denuncias Totales</div>
      </div>

      <!-- Evolution Chart (Sparkline placeholder) -->
      <div class="evolution-section q-mt-lg">
        <div class="section-title">Evolución 2019-2025</div>
        <div class="sparkline-container">
            <!-- Simple CSS Bar Sparkline -->
             <div class="spark-bars">
                <div v-for="(val, idx) in evolutionData" :key="idx" 
                     class="spark-bar" 
                     :style="{ height: (val / maxEvolution * 100) + '%' }"
                     :title="idx + 2019 + ': ' + val">
                </div>
             </div>
        </div>
      </div>

      <!-- Types of Violence -->
      <div class="types-section q-mt-lg">
        <div class="section-title">Por Tipología</div>
        <div class="types-list">
          <div v-for="(type, index) in topTypes" :key="index" class="type-item">
            <div class="type-info">
              <span class="type-name">{{ type.label }}</span>
              <span class="type-value">{{ type.value }}</span>
            </div>
            <div class="progress-bg">
              <div class="progress-fill" 
                   :style="{ width: (type.value / maxType * 100) + '%', backgroundColor: getTypeColor(index) }">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="sidebar-footer">
        <q-btn 
          outline 
          color="primary" 
          class="full-width q-py-sm rounded-borders" 
          label="Ver Dashboard Completo" 
          no-caps
          @click="$emit('view-details', department)"
        />
      </div>
    </div>
  </div>
  <div v-if="modelValue" class="sidebar-overlay" @click="$emit('update:modelValue', false)"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  department: Object
})

defineEmits(['update:modelValue', 'view-details'])

// Mock evolution data if not present (randomized based on total for effect)
const evolutionData = computed(() => {
    if (!props.department) return []
    // Generate valid numbers based roughly on the total
    const base = props.department.value / 7
    return Array.from({length: 7}, () => Math.floor(base + (Math.random() * base * 0.5)))
})

const maxEvolution = computed(() => Math.max(...evolutionData.value))

// Mock specific types for the department if not in data
const topTypes = computed(() => {
    // In a real app, 'department' would contain this detailed info. 
    // We will extract it or mock it.
    if (!props.department || !props.department.types) {
        // Mock distribution
        const total = props.department ? props.department.value : 1000
        return [
            { label: 'Violencia Física', value: Math.floor(total * 0.45) },
            { label: 'Psiciolgica', value: Math.floor(total * 0.30) },
            { label: 'Familiar', value: Math.floor(total * 0.15) },
            { label: 'Sexual', value: Math.floor(total * 0.08) },
            { label: 'Patrimonial', value: Math.floor(total * 0.02) }
        ]
    }
    return props.department.types
})

const maxType = computed(() => Math.max(...topTypes.value.map(t => t.value)))

const getTypeColor = (index) => {
    const colors = ['#F87171', '#60A5FA', '#34D399', '#A78BFA', '#9CA3AF']
    return colors[index % colors.length]
}
</script>

<style scoped>
.dept-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 320px;
  background: white;
  z-index: 2000;
  box-shadow: -4px 0 20px rgba(0,0,0,0.1);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 24px;
  overflow-y: auto;
}

.dept-sidebar.is-open {
  transform: translateX(0);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 1999;
  backdrop-filter: blur(2px);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.dept-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
  display: flex;
  align-items: center;
}

.main-stat {
  margin-bottom: 32px;
}

.stat-number {
  font-size: 3rem;
  font-weight: 800;
  color: #1E293B;
  line-height: 1;
  letter-spacing: -0.02em;
}

.stat-label {
  color: #64748B;
  font-size: 1rem;
  margin-top: 4px;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #94A3B8;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Sparkline */
.sparkline-container {
    height: 60px;
    display: flex;
    align-items: flex-end;
}
.spark-bars {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    width: 100%;
    height: 100%;
}
.spark-bar {
    flex: 1;
    background: #E0E7FF;
    border-radius: 4px;
    transition: height 0.5s ease;
}
.spark-bar:hover {
    background: #6366F1;
}

/* Type Bars */
.type-item {
  margin-bottom: 16px;
}

.type-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 6px;
  color: #334155;
  font-weight: 500;
}

.progress-bg {
  height: 6px;
  background: #F1F5F9;
  border-radius: 99px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 1s ease;
}

.sidebar-footer {
  margin-top: 40px;
}

/* Mobile */
@media (max-width: 600px) {
  .dept-sidebar {
    width: 100%;
    max-width: 100%;
    top: auto;
    bottom: 0;
    height: 85vh;
    border-radius: 24px 24px 0 0;
    transform: translateY(100%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .dept-sidebar.is-open {
    transform: translateY(0);
  }
}
</style>
