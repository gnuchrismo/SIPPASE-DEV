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
  <q-page class="menu-manager-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <q-icon name="menu_book" size="42px" class="title-icon" />
          <div>
            <h1>Gestión de Menús</h1>
            <p class="subtitle">Administra la navegación de tu sitio de forma dinámica</p>
          </div>
        </div>
        <q-btn
          label="Nuevo Item"
          icon="add"
          color="primary"
          unelevated
          size="lg"
          class="create-btn"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <div class="menu-manager-container">
      <!-- Category Selector Sidebar -->
      <div class="category-sidebar">
        <div class="sidebar-header">
          <h3>Categorías de Menú</h3>
        </div>
        <q-list class="category-list">
          <q-item
            v-for="category in categories"
            :key="category.id"
            clickable
            v-ripple
            :active="selectedCategory?.id === category.id"
            @click="selectCategory(category)"
            class="category-item"
          >
            <q-item-section avatar>
              <q-avatar :color="getCategoryColor(category.location)" text-color="white" size="40px">
                <q-icon :name="getCategoryIcon(category.location)" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="category-name">{{ category.name }}</q-item-label>
              <q-item-label caption>{{ category.location }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge :color="category.is_active ? 'positive' : 'grey'" rounded />
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Menu Items Panel -->
      <div class="menu-items-panel">
        <div v-if="!selectedCategory" class="empty-state">
          <q-icon name="touch_app" size="80px" color="grey-5" />
          <h3>Selecciona una categoría</h3>
          <p>Elige una categoría de menú para ver y gestionar sus items</p>
        </div>

        <div v-else class="items-container">
          <div class="panel-header">
            <div>
              <h2>{{ selectedCategory.name }}</h2>
              <p class="category-description">{{ selectedCategory.description || 'Sin descripción' }}</p>
            </div>
            <div class="header-actions">
              <q-btn
                flat
                round
                icon="refresh"
                color="primary"
                @click="loadMenuItems"
                :loading="loading"
              >
                <q-tooltip>Actualizar</q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <q-spinner-dots size="50px" color="primary" />
            <p>Cargando items...</p>
          </div>

          <!-- Menu Items List -->
          <div v-else-if="menuItems.length > 0" class="menu-items-list">
            <VueDraggable
              v-model="menuItems"
              handle=".drag-handle"
              @end="handleReorder"
              :animation="200"
              class="draggable-list"
            >
              <div 
                v-for="element in menuItems" 
                :key="element.id" 
                class="menu-item-card" 
                :class="{ inactive: !element.is_active }"
              >
                  <div class="drag-handle">
                    <q-icon name="drag_indicator" />
                  </div>
                  
                  <div class="item-icon">
                    <q-avatar size="48px" :color="element.is_active ? 'primary' : 'grey-5'" text-color="white">
                      <q-icon :name="element.icon || 'link'" />
                    </q-avatar>
                  </div>

                  <div class="item-content">
                    <div class="item-header">
                      <h4>{{ element.title }}</h4>
                      <div class="item-badges">
                        <q-badge v-if="element.badge_text" :color="element.badge_color || 'primary'">
                          {{ element.badge_text }}
                        </q-badge>
                        <q-badge v-if="element.required_role" color="orange" outline>
                          <q-icon name="lock" size="12px" />
                          {{ element.required_role }}
                        </q-badge>
                        <q-badge v-if="!element.is_visible_public" color="grey" outline>
                          <q-icon name="visibility_off" size="12px" />
                          Oculto
                        </q-badge>
                      </div>
                    </div>
                    <p class="item-description">{{ element.description || 'Sin descripción' }}</p>
                    <div class="item-meta">
                      <span v-if="element.route_path" class="meta-item">
                        <q-icon name="link" size="16px" />
                        {{ element.route_path }}
                      </span>
                      <span v-if="element.external_url" class="meta-item">
                        <q-icon name="open_in_new" size="16px" />
                        {{ element.external_url }}
                      </span>
                      <span class="meta-item">
                        <q-icon name="sort" size="16px" />
                        Orden: {{ element.display_order }}
                      </span>
                    </div>
                  </div>

                  <div class="item-actions">
                    <q-btn
                      flat
                      round
                      icon="edit"
                      color="primary"
                      size="sm"
                      @click="editMenuItem(element)"
                    >
                      <q-tooltip>Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      :icon="element.is_active ? 'visibility' : 'visibility_off'"
                      :color="element.is_active ? 'positive' : 'grey'"
                      size="sm"
                      @click="toggleActive(element)"
                    >
                      <q-tooltip>{{ element.is_active ? 'Desactivar' : 'Activar' }}</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      icon="delete"
                      color="negative"
                      size="sm"
                      @click="confirmDelete(element)"
                    >
                      <q-tooltip>Eliminar</q-tooltip>
                    </q-btn>
                  </div>

                  <!-- Child Items -->
                  <div v-if="element.children && element.children.length > 0" class="child-items">
                    <div v-for="child in element.children" :key="child.id" class="child-item">
                      <q-icon name="subdirectory_arrow_right" size="20px" />
                      <span>{{ child.title }}</span>
                      <q-space />
                      <q-btn flat dense round icon="edit" size="xs" @click="editMenuItem(child)" />
                    </div>
                  </div>
              </div>
            </VueDraggable>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-items-state">
            <q-icon name="menu" size="60px" color="grey-4" />
            <h4>No hay items en esta categoría</h4>
            <p>Crea el primer item de menú para comenzar</p>
            <q-btn
              label="Crear Item"
              icon="add"
              color="primary"
              unelevated
              @click="openCreateDialog"
            />
          </div>
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="preview-panel">
        <div class="preview-header">
          <h3>Vista Previa</h3>
          <q-btn-toggle
            v-model="previewMode"
            toggle-color="primary"
            :options="[
              { label: 'Desktop', value: 'desktop', icon: 'computer' },
              { label: 'Mobile', value: 'mobile', icon: 'phone_iphone' }
            ]"
            unelevated
            dense
          />
        </div>
        <div class="preview-content" :class="previewMode">
          <div v-if="selectedCategory?.location === 'admin'" class="preview-admin-menu">
            <div class="preview-menu-header">SIPPASE Admin</div>
            <div v-for="item in activeMenuItems" :key="item.id" class="preview-menu-item">
              <q-icon :name="item.icon || 'link'" />
              <span>{{ item.title }}</span>
              <q-badge v-if="item.badge_text" :color="item.badge_color || 'red'" floating>
                {{ item.badge_text }}
              </q-badge>
            </div>
          </div>
          <div v-else class="preview-public-menu">
            <nav class="preview-nav">
              <a v-for="item in activeMenuItems" :key="item.id" class="preview-nav-link">
                {{ item.title }}
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showDialog" persistent no-backdrop-dismiss>
      <q-card class="menu-dialog">
        <q-card-section class="dialog-header">
          <h2>{{ editingItem ? 'Editar Item' : 'Nuevo Item de Menú' }}</h2>
          <q-btn flat round dense icon="close" @click="closeDialog" />
        </q-card-section>

        <q-card-section class="dialog-content">
          <q-form @submit="saveMenuItem" class="menu-form">
            <div class="form-row">
              <q-input
                v-model="formData.title"
                label="Título *"
                outlined
                dense
                :rules="[val => !!val || 'El título es requerido']"
                :error="!!validationErrors.title"
                :error-message="validationErrors.title"
                class="form-field"
              />
              <icon-picker
                v-model="formData.icon"
                class="form-field"
              />
            </div>

            <q-input
              v-model="formData.description"
              label="Descripción"
              outlined
              dense
              type="textarea"
              rows="2"
              :error="!!validationErrors.description"
              :error-message="validationErrors.description"
            />

            <!-- Page Selector -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">Enlazar a Página</div>
              <q-select
                v-model="selectedPage"
                :options="availablePages"
                option-value="slug"
                option-label="title"
                outlined
                dense
                clearable
                label="Seleccionar Página"
                hint="Selecciona una página existente para enlazar automáticamente"
                @update:model-value="onPageSelected"
                :loading="loadingPages"
              >
                <template v-slot:prepend>
                  <q-icon name="article" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon name="article" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.title }}</q-item-label>
                      <q-item-label caption>/page/{{ scope.opt.slug }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>


            <div class="form-row">
              <q-input
                v-model="formData.route_path"
                label="Ruta"
                outlined
                dense
                hint="Ej: /admin/dashboard o #seccion"
                :error="!!validationErrors.route_path"
                :error-message="validationErrors.route_path"
                class="form-field"
              />
              <q-input
                v-model="formData.external_url"
                label="URL Externa"
                outlined
                dense
                hint="Ej: https://ejemplo.com"
                :error="!!validationErrors.external_url"
                :error-message="validationErrors.external_url"
                class="form-field"
              />
            </div>

            <div class="form-row">
              <q-input
                v-model.number="formData.display_order"
                label="Orden"
                outlined
                dense
                type="number"
                class="form-field"
              />
              <q-select
                v-model="formData.required_role"
                :options="roleOptions"
                label="Rol Requerido"
                outlined
                dense
                clearable
                emit-value
                map-options
                class="form-field"
              />
            </div>

            <div class="form-row">
              <q-input
                v-model="formData.badge_text"
                label="Texto de Badge"
                outlined
                dense
                class="form-field"
              />
              <q-select
                v-model="formData.badge_color"
                :options="colorOptions"
                label="Color de Badge"
                outlined
                dense
                emit-value
                map-options
                class="form-field"
              />
            </div>

            <div class="form-toggles">
              <q-toggle v-model="formData.is_active" label="Activo" color="positive" />
              <q-toggle v-model="formData.is_visible_public" label="Visible Públicamente" color="primary" />
              <q-toggle v-model="formData.open_in_new_tab" label="Abrir en Nueva Pestaña" color="info" />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions class="dialog-actions">
          <q-btn label="Cancelar" flat @click="closeDialog" />
          <q-btn
            label="Guardar"
            color="primary"
            unelevated
            @click="saveMenuItem"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../../boot/axios'
import { VueDraggable } from 'vue-draggable-plus'
import IconPicker from '../../components/common/IconPicker.vue'

const $q = useQuasar()

// State
const categories = ref([])
const selectedCategory = ref(null)
const menuItems = ref([])
const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const editingItem = ref(null)
const previewMode = ref('desktop')
const validationErrors = ref({})
const availablePages = ref([])
const selectedPage = ref(null)
const loadingPages = ref(false)


// Form Data
const formData = ref({
  title: '',
  description: '',
  icon: 'link',
  route_path: '',
  external_url: '',
  display_order: 0,
  is_active: true,
  is_visible_public: true,
  required_role: null,
  open_in_new_tab: false,
  badge_text: '',
  badge_color: 'primary'
})

// Options
// iconOptions removed in favor of IconPicker component

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' }
]

const colorOptions = [
  { label: 'Primario', value: 'primary' },
  { label: 'Positivo', value: 'positive' },
  { label: 'Negativo', value: 'negative' },
  { label: 'Advertencia', value: 'warning' },
  { label: 'Info', value: 'info' },
  { label: 'Rojo', value: 'red' },
  { label: 'Naranja', value: 'orange' }
]

// Computed
const activeMenuItems = computed(() => {
  return menuItems.value.filter(item => item.is_active)
})

// Methods
async function loadCategories() {
  try {
    const response = await api.get('/menus/categories')
    categories.value = response.data
  } catch (error) {
    console.error('Error loading categories:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar categorías de menú',
      position: 'top'
    })
  }
}

async function loadMenuItems() {
  if (!selectedCategory.value) return
  
  loading.value = true
  try {
    const response = await api.get(`/menus/categories/${selectedCategory.value.id}/items`)
    menuItems.value = response.data
  } catch (error) {
    console.error('Error loading menu items:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar items de menú',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

function selectCategory(category) {
  selectedCategory.value = category
  loadMenuItems()
}

function getCategoryColor(location) {
  const colors = {
    admin: 'primary',
    public: 'positive',
    footer: 'info',
    mobile: 'orange'
  }
  return colors[location] || 'grey'
}

function getCategoryIcon(location) {
  const icons = {
    admin: 'admin_panel_settings',
    public: 'public',
    footer: 'web',
    mobile: 'phone_iphone'
  }
  return icons[location] || 'menu'
}

function openCreateDialog() {
  if (!selectedCategory.value) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona una categoría primero',
      position: 'top'
    })
    return
  }
  
  editingItem.value = null
  formData.value = {
    title: '',
    description: '',
    icon: 'link',
    route_path: '',
    external_url: '',
    display_order: menuItems.value.length,
    is_active: true,
    is_visible_public: true,
    required_role: null,
    open_in_new_tab: false,
    badge_text: '',
    badge_color: 'primary'
  }
  showDialog.value = true
}

function editMenuItem(item) {
  editingItem.value = item
  formData.value = { ...item }
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  editingItem.value = null
}

async function saveMenuItem() {
  // Clear previous validation errors
  validationErrors.value = {}
  
  // Basic client-side validation
  if (!formData.value.title || formData.value.title.trim().length === 0) {
    validationErrors.value.title = 'El título es requerido'
    $q.notify({
      type: 'warning',
      message: 'Por favor, corrija los errores en el formulario',
      position: 'top'
    })
    return
  }

  saving.value = true
  try {
    const data = {
      ...formData.value,
      category_id: selectedCategory.value.id
    }

    let response
    if (editingItem.value) {
      response = await api.put(`/menus/items/${editingItem.value.id}`, data)
      
      // Optimistic update
      const index = menuItems.value.findIndex(item => item.id === editingItem.value.id)
      if (index !== -1) {
        menuItems.value[index] = response.data
      }
      
      $q.notify({
        type: 'positive',
        message: 'Item actualizado exitosamente',
        position: 'top',
        icon: 'check_circle'
      })
    } else {
      response = await api.post('/menus/items', data)
      
      // Optimistic update
      menuItems.value.push(response.data)
      
      $q.notify({
        type: 'positive',
        message: 'Item creado exitosamente',
        position: 'top',
        icon: 'check_circle'
      })
    }

    closeDialog()
    // Reload to ensure consistency
    setTimeout(() => loadMenuItems(), 500)
  } catch (error) {
    console.error('Error saving menu item:', error)
    
    // Handle validation errors from backend
    if (error.response?.status === 400 && error.response?.data?.errors) {
      const errors = error.response.data.errors
      errors.forEach(err => {
        validationErrors.value[err.field] = err.message
      })
      
      $q.notify({
        type: 'warning',
        message: error.response.data.error || 'Por favor, corrija los errores en el formulario',
        position: 'top',
        icon: 'warning'
      })
    } else {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Error al guardar el item',
        position: 'top',
        icon: 'error'
      })
    }
  } finally {
    saving.value = false
  }
}

async function toggleActive(item) {
  try {
    await api.put(`/menus/items/${item.id}`, {
      ...item,
      is_active: !item.is_active
    })
    
    item.is_active = !item.is_active
    $q.notify({
      type: 'positive',
      message: `Item ${item.is_active ? 'activado' : 'desactivado'}`,
      position: 'top'
    })
  } catch (error) {
    console.error('Error toggling item:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cambiar estado',
      position: 'top'
    })
  }
}

function confirmDelete(item) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar "${item.title}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/menus/items/${item.id}`)
      
      $q.notify({
        type: 'positive',
        message: 'Item eliminado exitosamente',
        position: 'top'
      })
      loadMenuItems()
    } catch (error) {
      console.error('Error deleting item:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el item',
        position: 'top'
      })
    }
  })
}

async function handleReorder() {
  try {
    // Map menuItems to include only id and display_order
    const items = menuItems.value.map((item, index) => ({
      id: item.id,
      display_order: index
    }))
    
    await api.put('/menus/items/reorder', { items })
    
    $q.notify({
      type: 'positive',
      message: 'Orden actualizado',
      position: 'top',
      timeout: 1000
    })
  } catch (error) {
    console.error('Error reordering items:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al reordenar items',
      position: 'top'
    })
    loadMenuItems() // Reload to reset order
  }
}

// Load available pages for selection
async function loadPages() {
  loadingPages.value = true
  try {
    const response = await api.get('/pages/published')
    availablePages.value = response.data
  } catch (error) {
    console.error('Error loading pages:', error)
  } finally {
    loadingPages.value = false
  }
}

// Handle page selection
function onPageSelected(page) {
  if (page) {
    formData.value.route_path = `/page/${page.slug}`
    formData.value.external_url = ''
    $q.notify({
      type: 'info',
      message: `Ruta configurada: /page/${page.slug}`,
      position: 'top',
      timeout: 2000
    })
  }
}

onMounted(() => {
  loadCategories()
  loadPages()
})
</script>

<style scoped>
.menu-manager-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 20px;
}

.title-icon {
  color: #667eea;
}

.header-title h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 14px;
}

.create-btn {
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.menu-manager-container {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 24px;
  height: calc(100vh - 180px);
}

/* Category Sidebar */
.category-sidebar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.sidebar-header h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.category-list {
  padding: 0;
}

.category-item {
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.category-item:hover {
  background: rgba(102, 126, 234, 0.05);
  transform: translateX(4px);
}

.category-item.q-item--active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-left: 4px solid #667eea;
}

.category-name {
  font-weight: 600;
  color: #333;
}

/* Menu Items Panel */
.menu-items-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  color: #666;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.panel-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.category-description {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 14px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 16px;
  color: #666;
}

/* Menu Item Cards */
.menu-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 16px;
  align-items: start;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.menu-item-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.menu-item-card.inactive {
  opacity: 0.6;
  background: #f5f5f5;
}

.drag-handle {
  cursor: grab;
  color: #999;
  display: flex;
  align-items: center;
  padding: 4px;
}

.drag-handle:active {
  cursor: grabbing;
}

.item-icon {
  display: flex;
  align-items: center;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.item-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.item-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.item-description {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.item-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;
  font-size: 13px;
}

.item-actions {
  display: flex;
  gap: 4px;
}

.child-items {
  grid-column: 2 / -1;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.child-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
}

.empty-items-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
  gap: 16px;
}

.empty-items-state h4 {
  margin: 0;
  color: #666;
}

.empty-items-state p {
  margin: 0;
  color: #999;
}

/* Preview Panel */
.preview-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.preview-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.preview-content {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  min-height: 400px;
}

.preview-content.mobile {
  max-width: 375px;
  margin: 0 auto;
}

.preview-admin-menu {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-menu-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  font-weight: 600;
  font-size: 16px;
}

.preview-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  position: relative;
  transition: background 0.2s;
}

.preview-menu-item:hover {
  background: rgba(102, 126, 234, 0.05);
}

.preview-public-menu {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-nav-link {
  padding: 10px 16px;
  border-radius: 6px;
  color: #333;
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
}

.preview-nav-link:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

/* Dialog */
.menu-dialog {
  width: 700px;
  max-width: 90vw;
  border-radius: 16px;
}

.dialog-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
}

.dialog-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.dialog-content {
  padding: 24px;
}

.menu-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-toggles {
  display: flex;
  gap: 24px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.dialog-actions {
  padding: 16px 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Responsive */
@media (max-width: 1400px) {
  .menu-manager-container {
    grid-template-columns: 260px 1fr;
  }
  
  .preview-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .menu-manager-container {
    grid-template-columns: 1fr;
  }
  
  .category-sidebar {
    height: auto;
    max-height: 200px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
