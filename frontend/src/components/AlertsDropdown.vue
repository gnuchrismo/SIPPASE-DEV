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
  <q-menu
    transition-show="jump-down"
    transition-hide="jump-up"
    max-width="400px"
    class="alerts-menu"
  >
    <q-card class="alerts-card">
      <!-- Header -->
      <q-card-section class="alerts-header">
        <div class="header-content">
          <div class="header-title">
            <q-icon name="notifications" size="24px" />
            <span>Notificaciones</span>
          </div>
          <q-badge v-if="unreadCount > 0" :label="unreadCount" color="red" rounded />
        </div>
        <q-btn
          v-if="alerts.length > 0"
          flat
          dense
          size="sm"
          label="Marcar todas como leídas"
          @click="markAllAsRead"
          class="mark-all-btn"
        />
      </q-card-section>

      <q-separator />

      <!-- Alerts List -->
      <q-scroll-area class="alerts-scroll" style="height: 400px">
        <q-list v-if="alerts.length > 0" class="alerts-list">
          <q-item
            v-for="alert in alerts"
            :key="alert.id"
            clickable
            v-ripple
            :class="['alert-item', `alert-${alert.type}`, { 'alert-unread': !alert.is_read }]"
            @click="handleAlertClick(alert)"
          >
            <q-item-section avatar>
              <q-avatar :color="getAlertColor(alert.type)" text-color="white" size="40px">
                <q-icon :name="getAlertIcon(alert.type)" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="alert-title">{{ alert.title }}</q-item-label>
              <q-item-label caption class="alert-message">{{ alert.message }}</q-item-label>
              <q-item-label caption class="alert-time">
                {{ formatTime(alert.created_at) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="close"
                @click.stop="deleteAlert(alert.id)"
                class="delete-btn"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="no-alerts">
          <q-icon name="notifications_none" size="64px" color="grey-5" />
          <p>No hay notificaciones</p>
        </div>
      </q-scroll-area>

      <q-separator />

      <!-- Footer -->
      <q-card-section class="alerts-footer">
        <q-btn
          flat
          dense
          color="primary"
          label="Ver todas"
          icon-right="arrow_forward"
          @click="viewAll"
          class="view-all-btn"
        />
      </q-card-section>
    </q-card>
  </q-menu>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../boot/axios'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const emit = defineEmits(['alerts-loaded'])

const alerts = ref([])
const unreadCount = ref(0)

async function loadAlerts() {
  try {
    const response = await api.get('/alerts', {
      params: { limit: 5, unreadOnly: false }
    })
    alerts.value = response.data.alerts
    unreadCount.value = response.data.unreadCount
    
    // Emit event to parent
    emit('alerts-loaded', {
      alerts: response.data.alerts,
      unreadCount: response.data.unreadCount,
      total: response.data.total
    })
  } catch (error) {
    console.error('Error loading alerts:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las notificaciones',
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
      message: 'Error al marcar las notificaciones',
      position: 'top'
    })
  }
}

async function handleAlertClick(alert) {
  if (!alert.is_read) {
    try {
      await api.put(`/alerts/${alert.id}/read`)
      await loadAlerts()
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }
  
  if (alert.link) {
    router.push(alert.link)
  }
}

async function deleteAlert(id) {
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
}

function viewAll() {
  router.push('/admin/alerts')
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

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  if (hours < 24) return `Hace ${hours}h`
  if (days < 7) return `Hace ${days}d`
  return date.toLocaleDateString()
}

onMounted(() => {
  loadAlerts()
})

defineExpose({
  loadAlerts
})
</script>

<style scoped>
.alerts-menu {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.alerts-card {
  min-width: 380px;
  max-width: 400px;
}

.alerts-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.mark-all-btn {
  color: white;
  font-size: 12px;
  text-transform: none;
}

.alerts-scroll {
  background: #fafafa;
}

.alerts-list {
  padding: 0;
}

.alert-item {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  background: white;
}

.alert-item:hover {
  background: #f5f5f5;
  transform: translateX(4px);
}

.alert-unread {
  background: #f0f4ff;
  border-left: 4px solid #667eea;
}

.alert-unread:hover {
  background: #e8eeff;
}

.alert-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.alert-message {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 4px;
}

.alert-time {
  font-size: 11px;
  color: #999;
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.alert-item:hover .delete-btn {
  opacity: 1;
}

.no-alerts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.no-alerts p {
  margin-top: 16px;
  font-size: 14px;
}

.alerts-footer {
  padding: 12px 16px;
  background: white;
}

.view-all-btn {
  width: 100%;
  text-transform: none;
  font-weight: 600;
}
</style>
