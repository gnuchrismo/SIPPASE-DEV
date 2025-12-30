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
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="admin-header">
      <q-toolbar class="admin-toolbar">
        <q-btn 
          dense 
          flat 
          round 
          icon="menu" 
          @click="toggleLeftDrawer"
          class="menu-btn"
        />
        <q-toolbar-title class="toolbar-title">
          <div class="logo-container">
            <q-icon name="admin_panel_settings" size="32px" class="logo-icon" />
            <span class="logo-text">SIPPASE Admin</span>
          </div>
        </q-toolbar-title>
        
        <div class="header-actions">
          <q-btn 
            flat 
            round 
            icon="notifications"
            class="action-btn"
          >
            <q-badge v-if="unreadAlertsCount > 0" :label="unreadAlertsCount" color="red" floating />
            <q-tooltip>Notificaciones</q-tooltip>
            <AlertsDropdown ref="alertsDropdownRef" @alerts-loaded="handleAlertsLoaded" />
          </q-btn>
          
          <q-btn 
            flat 
            round 
            class="action-btn"
          >
            <q-avatar size="32px">
              <img v-if="userAvatar" :src="userAvatar">
              <q-icon v-else name="person" />
            </q-avatar>
            <q-menu>
              <q-list style="min-width: 200px">
                <q-item clickable v-close-popup @click="goToProfile">
                  <q-item-section avatar>
                    <q-avatar size="40px">
                        <img v-if="userAvatar" :src="userAvatar">
                        <q-icon v-else name="person" color="primary" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ userFullName }}</q-item-label>
                    <q-item-label caption>{{ userRole }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="goToProfile">
                  <q-item-section avatar>
                    <q-icon name="manage_accounts" color="primary" />
                  </q-item-section>
                  <q-item-section>Mi Perfil</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="logout">
                  <q-item-section avatar>
                    <q-icon name="logout" color="negative" />
                  </q-item-section>
                  <q-item-section>Cerrar Sesión</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer 
      show-if-above 
      v-model="leftDrawerOpen" 
      side="left" 
      bordered
      :width="280"
      class="admin-drawer"
    >
      <div class="column fit">
        <!-- User Profile Section -->
        <div class="drawer-profile col-auto cursor-pointer" @click="goToProfile">
          <q-avatar size="60px" class="q-mb-sm shadow-2">
             <img v-if="userAvatar" :src="userAvatar">
             <q-icon v-else name="person" size="32px" />
          </q-avatar>
          <div class="profile-info">
            <div class="profile-name">{{ userFullName }}</div>
            <div class="profile-role">{{ userRole }}</div>
          </div>
        </div>

        <!-- Dynamic Menu -->
        <q-scroll-area class="col menu-scroll-area">
          <div v-if="loadingMenu" class="menu-loading">
            <q-spinner-dots size="40px" color="primary" />
            <p>Cargando menú...</p>
          </div>

          <q-list v-else class="admin-menu">
            <template v-for="(category, categoryKey) in menuStructure" :key="categoryKey">
              <q-item-label 
                v-if="category && category.name" 
                header 
                class="menu-category-header"
              >
                {{ category.name }}
              </q-item-label>

              <template v-for="item in category.items" :key="item.id">
                <!-- Top-level menu item -->
                <q-item
                  v-if="item && item.route_path && (!item.children || item.children.length === 0)"
                  clickable
                  v-ripple
                  :to="item.route_path"
                  class="menu-item"
                  :class="{ 'menu-item-active': isActiveRoute(item.route_path) }"
                >
                  <q-item-section avatar>
                    <q-avatar 
                      :color="isActiveRoute(item.route_path) ? 'primary' : 'grey-3'" 
                      :text-color="isActiveRoute(item.route_path) ? 'white' : 'grey-7'"
                      size="40px"
                    >
                      <q-icon :name="item.icon || 'link'" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="menu-item-label">{{ item.title }}</q-item-label>
                    <q-item-label caption v-if="item.description" class="menu-item-caption">
                      {{ item.description }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side v-if="item.badge_text">
                    <q-badge :color="item.badge_color || 'red'" rounded>
                      {{ item.badge_text }}
                    </q-badge>
                  </q-item-section>
                </q-item>

                <!-- Expandable menu item with children -->
                <q-expansion-item
                  v-else-if="item"
                  :icon="item.icon || 'folder'"
                  :label="item.title"
                  :caption="item.description"
                  class="menu-expansion"
                  :default-opened="hasActiveChild(item)"
                >
                  <q-item
                    v-for="child in item.children"
                    :key="child.id"
                    clickable
                    v-ripple
                    :to="child.route_path"
                    class="menu-item menu-item-child"
                    :class="{ 'menu-item-active': isActiveRoute(child.route_path) }"
                    :inset-level="1"
                  >
                    <q-item-section avatar>
                      <q-icon :name="child.icon || 'subdirectory_arrow_right'" size="20px" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ child.title }}</q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="child.badge_text">
                      <q-badge :color="child.badge_color || 'red'" rounded>
                        {{ child.badge_text }}
                      </q-badge>
                    </q-item-section>
                  </q-item>
                </q-expansion-item>
              </template>

              <q-separator class="menu-separator" />
            </template>
          </q-list>
        </q-scroll-area>

        <!-- Drawer Footer -->
        <div class="drawer-footer col-auto">
          <div class="footer-info">
            <q-icon name="info" size="16px" />
            <span>v1.0.0.1</span>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container class="admin-page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../boot/axios'
import { useAuthStore } from '../stores/authStore'
import AlertsDropdown from '../components/AlertsDropdown.vue'

const leftDrawerOpen = ref(false)
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const menuStructure = ref({})
const loadingMenu = ref(true)
const alertsDropdownRef = ref(null)
const unreadAlertsCount = ref(0)

// Computed properties for user info from store
const userEmail = computed(() => authStore.user?.email || authStore.user?.username || 'Usuario')
const userRole = computed(() => authStore.user?.role === 'admin' ? 'Administrador' : 'Editor')
const userFullName = computed(() => authStore.user?.full_name || authStore.user?.username || 'Usuario')
const userAvatar = computed(() => {
    if (authStore.user?.avatar_url) {
        if (authStore.user.avatar_url.startsWith('http')) return authStore.user.avatar_url
        return `${import.meta.env.VITE_API_URL.replace('/api', '')}${authStore.user.avatar_url}`
    }
    return null
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function isActiveRoute(path) {
  if (!path) return false
  return route.path === path || route.path.startsWith(path + '/')
}

function hasActiveChild(item) {
  if (!item.children) return false
  return item.children.some(child => isActiveRoute(child.route_path))
}

async function loadAdminMenu() {
  loadingMenu.value = true
  try {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
    if (!token) {
      menuStructure.value = getDefaultMenuStructure()
      return
    }

    const response = await api.get('/menus/admin')
    menuStructure.value = response.data
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      menuStructure.value = getDefaultMenuStructure()
    } else {
      console.error('Error loading admin menu:', error)
      menuStructure.value = getDefaultMenuStructure()
    }
  } finally {
    loadingMenu.value = false
  }
}

function getDefaultMenuStructure() {
  return {
    'admin-main': {
      name: 'Menú Principal',
      items: [
        { id: 1, title: 'Dashboard', icon: 'dashboard', route_path: '/admin/dashboard' },
        { id: 2, title: 'Gestión de Menús', icon: 'menu_book', route_path: '/admin/menu-manager' },
        { id: 3, title: 'Sliders', icon: 'view_carousel', route_path: '/admin/sliders' },
        { id: 4, title: 'Sección Hero', icon: 'web', route_path: '/admin/settings' },
        { id: 5, title: 'Sistemas', icon: 'apps', route_path: '/admin/systems' },
        { id: 6, title: 'Documentos', icon: 'description', route_path: '/admin/documents' },
        { id: 15, title: 'Categorías Docs', icon: 'category', route_path: '/admin/document-categories' },
        { id: 13, title: 'Blog / Noticias', icon: 'article', route_path: '/admin/blog' },
        { id: 7, title: 'Estadísticas', icon: 'bar_chart', route_path: '/admin/statistics' },
        { id: 8, title: 'Mensajes', icon: 'mail', route_path: '/admin/messages' },
        { id: 9, title: 'Usuarios', icon: 'people', route_path: '/admin/users' },
        { id: 10, title: 'Audit Logs', icon: 'history', route_path: '/admin/audit-logs' },
        { id: 11, title: 'Roles', icon: 'security', route_path: '/admin/roles' },
        { id: 12, title: 'Media', icon: 'perm_media', route_path: '/admin/media' },
        { id: 14, title: 'SEO / Sitemap', icon: 'search', route_path: '/admin/seo' }
      ]
    }
  }
}

function logout() {
  authStore.logout()
  router.push('/admin/login')
}

function goToProfile() {
    router.push('/admin/profile')
}

function handleAlertsLoaded(data) {
  unreadAlertsCount.value = data.unreadCount
}

onMounted(() => {
  if (authStore.user) {
      // Ensure we have the latest profile data
      authStore.fetchProfile()
  }
  loadAdminMenu()
})
</script>

<style scoped>
/* Header Styles */
.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.admin-toolbar {
  padding: 8px 16px;
}

.menu-btn {
  transition: transform 0.3s ease;
}

.menu-btn:hover {
  transform: rotate(90deg);
}

.toolbar-title {
  font-size: 20px;
  font-weight: 600;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.logo-text {
  font-weight: 700;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

/* Drawer Styles */
.admin-drawer {
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  border-right: 1px solid rgba(102, 126, 234, 0.1);
}

.drawer-profile {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.profile-info {
  text-align: center;
  color: white;
}

.profile-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.profile-role {
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.menu-scroll-area {
  /* Height is handled by flex col */
}

.menu-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
  gap: 12px;
}

.admin-menu {
  padding: 12px 8px;
}

.menu-category-header {
  color: #667eea;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 16px 16px 8px 16px;
  margin-top: 8px;
}

.menu-item {
  border-radius: 12px;
  margin: 4px 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.menu-item:hover {
  background: rgba(102, 126, 234, 0.05);
  transform: translateX(4px);
}

.menu-item:hover::before {
  transform: scaleY(1);
}

.menu-item-active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  font-weight: 600;
}

.menu-item-active::before {
  transform: scaleY(1);
}

.menu-item-label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.menu-item-active .menu-item-label {
  color: #667eea;
  font-weight: 600;
}

.menu-item-caption {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.menu-item-child {
  padding-left: 24px;
}

.menu-expansion {
  margin: 4px 8px;
  border-radius: 12px;
}

.menu-expansion :deep(.q-item) {
  border-radius: 12px;
}

.menu-separator {
  margin: 12px 16px;
  background: rgba(102, 126, 234, 0.1);
}

.drawer-footer {
  /* Position handled by flex layout */
  padding: 16px 20px;
  background: rgba(102, 126, 234, 0.05);
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #999;
  font-size: 12px;
  justify-content: center;
}

/* Page Container */
.admin-page-container {
  background: #f5f7fa;
}

/* Responsive */
@media (max-width: 1023px) {
  .admin-drawer {
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>
