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
  <q-page class="alerts-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <q-icon name="notifications_active" size="40px" class="header-icon" />
            <div>
              <h1 class="page-title">Alertas y Notificaciones</h1>
              <p class="page-subtitle">Gestiona todas tus notificaciones del sistema</p>
            </div>
          </div>
          <div class="header-stats">
            <q-card class="stat-card">
              <q-card-section class="stat-content">
                <q-icon name="notifications" size="24px" color="primary" />
                <div>
                  <div class="stat-value">{{ totalAlerts }}</div>
                  <div class="stat-label">Total</div>
                </div>
              </q-card-section>
            </q-card>
            <q-card class="stat-card unread">
              <q-card-section class="stat-content">
                <q-icon name="mark_email_unread" size="24px" color="orange" />
                <div>
                  <div class="stat-value">{{ unreadCount }}</div>
                  <div class="stat-label">Sin leer</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Filters and Actions -->
      <q-card class="filters-card">
        <q-card-section class="filters-section">
          <div class="filters-left">
            <q-select
              v-model="filterType"
              :options="typeOptions"
              label="Tipo"
              outlined
              dense
              class="filter-select"
              @update:model-value="loadAlerts"
            />
            <q-select
              v-model="filterStatus"
              :options="statusOptions"
              label="Estado"
              outlined
              dense
              class="filter-select"
              @update:model-value="loadAlerts"
            />
          </div>
          <div class="filters-right">
            <q-btn
              flat
              color="primary"
              label="Marcar todas como leídas"
              icon="done_all"
              @click="markAllAsRead"
              :disable="unreadCount === 0"
            />
            <q-btn
              flat
              color="negative"
              label="Eliminar seleccionadas"
              icon="delete"
              @click="deleteSelected"
              :disable="selected.length === 0"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Alerts List -->
      <div class="alerts-container">
        <q-card v-if="loading" class="loading-card">
          <q-card-section class="text-center">
            <q-spinner-dots size="50px" color="primary" />
            <p class="q-mt-md">Cargando notificaciones...</p>
          </q-card-section>
        </q-card>

        <div v-else-if="alerts.length === 0" class="empty-state">
          <q-icon name="notifications_none" size="120px" color="grey-4" />
          <h3>No hay notificaciones</h3>
          <p>Cuando recibas notificaciones, aparecerán aquí</p>
        </div>

        <div v-else class="alerts-grid">
          <q-card
            v-for="alert in alerts"
            :key="alert.id"
            class="alert-card"
            :class="[`alert-${alert.type}`, { 'alert-unread': !alert.is_read }]"
          >
            <q-card-section class="alert-header">
              <q-checkbox
                v-model="selected"
                :val="alert.id"
                class="alert-checkbox"
              />
              <q-avatar :color="getAlertColor(alert.type)" text-color="white" size="48px">
                <q-icon :name="getAlertIcon(alert.type)" size="28px" />
              </q-avatar>
              <div class="alert-header-info">
                <div class="alert-title-row">
                  <h3 class="alert-title">{{ alert.title }}</h3>
                  <q-badge
                    v-if="!alert.is_read"
                    color="orange"
                    label="Nueva"
                    rounded
                  />
                </div>
                <p class="alert-time">{{ formatTime(alert.created_at) }}</p>
              </div>
              <q-btn
                flat
                dense
                round
                icon="more_vert"
                class="alert-menu-btn"
              >
                <q-menu>
                  <q-list style="min-width: 150px">
                    <q-item
                      v-if="!alert.is_read"
                      clickable
                      v-close-popup
                      @click="markAsRead(alert.id)"
                    >
                      <q-item-section avatar>
                        <q-icon name="done" color="green" />
                      </q-item-section>
                      <q-item-section>Marcar como leída</q-item-section>
                    </q-item>
                    <q-item
                      v-if="alert.link"
                      clickable
                      v-close-popup
                      @click="navigateTo(alert.link)"
                    >
                      <q-item-section avatar>
                        <q-icon name="open_in_new" color="blue" />
                      </q-item-section>
                      <q-item-section>Ir al enlace</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item
                      clickable
                      v-close-popup
                      @click="deleteAlert(alert.id)"
                    >
                      <q-item-section avatar>
                        <q-icon name="delete" color="red" />
                      </q-item-section>
                      <q-item-section>Eliminar</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-card-section>

            <q-separator />

            <q-card-section class="alert-body">
              <p class="alert-message">{{ alert.message }}</p>
              <q-btn
                v-if="alert.link"
                flat
                dense
                color="primary"
                :label="'Ir a ' + getLinkLabel(alert.link)"
                icon-right="arrow_forward"
                @click="navigateTo(alert.link)"
                class="alert-link-btn"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Pagination -->
        <div v-if="totalAlerts > limit" class="pagination-container">
          <q-pagination
            v-model="currentPage"
            :max="Math.ceil(totalAlerts / limit)"
            :max-pages="7"
            direction-links
            boundary-links
            color="primary"
            @update:model-value="loadAlerts"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../boot/axios'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const alerts = ref([])
const selected = ref([])
const loading = ref(false)
const totalAlerts = ref(0)
const unreadCount = ref(0)
const currentPage = ref(1)
const limit = 12

const filterType = ref('all')
const filterStatus = ref('all')

const typeOptions = [
  { label: 'Todos los tipos', value: 'all' },
  { label: 'Información', value: 'info' },
  { label: 'Éxito', value: 'success' },
  { label: 'Advertencia', value: 'warning' },
  { label: 'Error', value: 'error' }
]

const statusOptions = [
  { label: 'Todas', value: 'all' },
  { label: 'Sin leer', value: 'unread' },
  { label: 'Leídas', value: 'read' }
]

async function loadAlerts() {
  loading.value = true
  try {
    const offset = (currentPage.value - 1) * limit
    const params = { limit, offset }
    
    if (filterStatus.value === 'unread') {
      params.unreadOnly = true
    }
    
    const response = await api.get('/alerts', { params })
    
    let filteredAlerts = response.data.alerts
    
    // Filter by type if needed
    if (filterType.value !== 'all') {
      filteredAlerts = filteredAlerts.filter(a => a.type === filterType.value)
    }
    
    // Filter by status if needed (client-side for read status)
    if (filterStatus.value === 'read') {
      filteredAlerts = filteredAlerts.filter(a => a.is_read)
    }
    
    alerts.value = filteredAlerts
    totalAlerts.value = response.data.total
    unreadCount.value = response.data.unreadCount
  } catch (error) {
    console.error('Error loading alerts:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las notificaciones',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

async function markAsRead(id) {
  try {
    await api.put(`/alerts/${id}/read`)
    await loadAlerts()
    $q.notify({
      type: 'positive',
      message: 'Notificación marcada como leída',
      position: 'top'
    })
  } catch (error) {
    console.error('Error marking alert as read:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar la notificación',
      position: 'top'
    })
  }
}

async function markAllAsRead() {
  try {
    await api.put('/alerts/read-all')
    await loadAlerts()
    $q.notify({
      type: 'positive',
      message: 'Todas las notificaciones marcadas como leídas',
      position: 'top'
    })
  } catch (error) {
    console.error('Error marking all as read:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar las notificaciones',
      position: 'top'
    })
  }
}

async function deleteAlert(id) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de que deseas eliminar esta notificación?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/alerts/${id}`)
      await loadAlerts()
      $q.notify({
        type: 'positive',
        message: 'Notificación eliminada',
        position: 'top'
      })
    } catch (error) {
      console.error('Error deleting alert:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar la notificación',
        position: 'top'
      })
    }
  })
}

async function deleteSelected() {
  if (selected.value.length === 0) return
  
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de que deseas eliminar ${selected.value.length} notificación(es)?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await Promise.all(selected.value.map(id => api.delete(`/alerts/${id}`)))
      selected.value = []
      await loadAlerts()
      $q.notify({
        type: 'positive',
        message: 'Notificaciones eliminadas',
        position: 'top'
      })
    } catch (error) {
      console.error('Error deleting alerts:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar las notificaciones',
        position: 'top'
      })
    }
  })
}

function navigateTo(link) {
  router.push(link)
}

function getAlertColor(type) {
  const colors = {
    info: 'blue',
    success: 'green',
    warning: 'orange',
    error: 'red'
  }
  return colors[type] || 'grey'
}

function getAlertIcon(type) {
  const icons = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error'
  }
  return icons[type] || 'notifications'
}

function getLinkLabel(link) {
  const labels = {
    '/admin/documents': 'Documentos',
    '/admin/messages': 'Mensajes',
    '/admin/audit-logs': 'Auditoría',
    '/admin/systems': 'Sistemas'
  }
  return labels[link] || 'Ver más'
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Ahora mismo'
  if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
  if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`
  
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadAlerts()
})
</script>

<style scoped>
.alerts-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

/* Header */
.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  color: #667eea;
}

.page-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #333;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 14px;
}

.header-stats {
  display: flex;
  gap: 16px;
}

.stat-card {
  min-width: 140px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px !important;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Filters */
.filters-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px !important;
}

.filters-left {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  min-width: 180px;
}

.filters-right {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Alerts Grid */
.alerts-container {
  margin-bottom: 24px;
}

.loading-card {
  padding: 60px 20px;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  color: #666;
}

.alerts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.alert-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.alert-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.alert-card.alert-info {
  border-left-color: #2196F3;
}

.alert-card.alert-success {
  border-left-color: #4CAF50;
}

.alert-card.alert-warning {
  border-left-color: #FF9800;
}

.alert-card.alert-error {
  border-left-color: #F44336;
}

.alert-unread {
  background: linear-gradient(to right, #f0f4ff 0%, #ffffff 100%);
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px !important;
}

.alert-checkbox {
  flex-shrink: 0;
}

.alert-header-info {
  flex: 1;
  min-width: 0;
}

.alert-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.alert-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alert-time {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.alert-menu-btn {
  flex-shrink: 0;
}

.alert-body {
  padding: 16px !important;
}

.alert-message {
  margin: 0 0 12px 0;
  color: #666;
  line-height: 1.6;
}

.alert-link-btn {
  text-transform: none;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

/* Responsive */
@media (max-width: 768px) {
  .alerts-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-stats {
    width: 100%;
  }
  
  .stat-card {
    flex: 1;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters-left,
  .filters-right {
    width: 100%;
  }
  
  .filter-select {
    width: 100%;
  }
}
</style>
