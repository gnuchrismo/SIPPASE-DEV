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
    <div class="row items-center justify-between q-mb-md">
      <h1 class="text-h4 q-my-none">Categorías de Documentos</h1>
      <div class="row q-gutter-sm">
        <q-btn 
          color="secondary" 
          icon="check" 
          label="Guardar Orden" 
          @click="saveOrder" 
          v-if="orderChanged" 
          :loading="savingOrder"
        />
        <q-btn color="primary" icon="add" label="Nueva Categoría" @click="openDialog()" />
      </div>
    </div>

    <!-- Instructions -->
    <q-banner class="bg-blue-1 text-blue-10 q-mb-md rounded-borders">
      <template v-slot:avatar>
        <q-icon name="info" color="blue" />
      </template>
      Administra las categorías para agrupar documentos y recursos. Arrastra las filas para reordenar las categorías (usando el icono de arrastre).
    </q-banner>

    <q-table
      :rows="categories"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :filter="filter"
      class="shadow-2"
      :pagination="{ rowsPerPage: 0 }"
    >
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="drag" :props="props" auto-width>
            <q-icon 
              name="drag_indicator" 
              class="cursor-pointer text-grey q-mr-sm drag-handle" 
              size="sm"
            />
            <div class="row-actions inline-block">
               <q-btn 
                flat round dense 
                icon="arrow_upward" 
                size="xs" 
                color="grey-7" 
                @click="moveUp(props.rowIndex)"
                :disable="props.rowIndex === 0"
              />
              <q-btn 
                flat round dense 
                icon="arrow_downward" 
                size="xs" 
                color="grey-7" 
                @click="moveDown(props.rowIndex)"
                :disable="props.rowIndex === categories.length - 1"
              />
            </div>
          </q-td>
          
          <q-td key="icon" :props="props">
            <q-icon :name="props.row.icon" size="md" color="primary" />
          </q-td>
          
          <q-td key="name" :props="props">
            <div class="text-subtitle2">{{ props.row.name }}</div>
          </q-td>
          
          <q-td key="description" :props="props">
            <div 
              class="ellipsis" 
              style="max-width: 300px" 
              v-html="truncateHtml(props.row.description, 100)"
            ></div>
          </q-td>
          
          <q-td key="display_order" :props="props">
            {{ props.row.display_order }}
          </q-td>
          
          <q-td key="is_active" :props="props">
            <q-chip 
              :color="props.row.is_active ? 'positive' : 'grey-7'" 
              text-color="white" 
              dense
            >
              {{ props.row.is_active ? 'Activo' : 'Inactivo' }}
            </q-chip>
          </q-td>
          
          <q-td key="actions" :props="props">
            <q-btn flat round color="primary" icon="edit" @click="openDialog(props.row)" size="sm" />
            <q-btn flat round color="negative" icon="delete" @click="confirmDelete(props.row)" size="sm" />
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="dialogOpen" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="column">
        <q-toolbar class="bg-primary text-white">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title>{{ editedItem.id ? 'Editar Categoría' : 'Nueva Categoría' }}</q-toolbar-title>
          <q-btn flat label="Guardar" @click="saveCategory" :loading="saving" />
        </q-toolbar>

        <q-card-section class="col q-pt-none scroll">
          <div class="q-pa-md" style="max-width: 800px; margin: 0 auto;">
          <q-form @submit="saveCategory" class="q-gutter-md q-mt-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-8">
                <q-input 
                  filled 
                  v-model="editedItem.name" 
                  label="Nombre de la Categoría *" 
                  :rules="[val => !!val || 'Requerido']" 
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  filled
                  v-model="editedItem.icon"
                  :options="iconOptions"
                  label="Icono"
                  hint="Selecciona un icono"
                  emit-value
                  map-options
                  use-input
                  input-debounce="0"
                  @filter="filterIcons"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-icon :name="scope.opt.value" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                        <q-item-label caption>{{ scope.opt.value }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="scope">
                    <div class="row items-center">
                      <q-icon :name="scope.opt.value" class="q-mr-sm" />
                      {{ scope.opt.label }}
                    </div>
                  </template>
                </q-select>
              </div>
            </div>

            <div class="q-my-md">
              <div class="text-subtitle2 q-mb-sm">Descripción</div>
              <RichTextEditor v-model="editedItem.description" :height="300" />
            </div>

            <div class="row items-center border-top q-pt-md">
              <q-toggle
                v-model="editedItem.is_active"
                label="Categoría Activa"
                color="positive"
              />
              <div class="text-caption text-grey q-ml-md">
                Las categorías inactivas no se mostrarán en el portal público público.
              </div>
            </div>
          </q-form>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../../boot/axios'
import { useQuasar } from 'quasar'
import RichTextEditor from '../../components/common/RichTextEditor.vue'

const $q = useQuasar()
const loading = ref(false)
const saving = ref(false)
const savingOrder = ref(false)
const categories = ref([])
const dialogOpen = ref(false)
const filter = ref('')
const orderChanged = ref(false)

const editedItem = ref({
  id: null,
  name: '',
  description: '',
  icon: 'folder',
  display_order: 0,
  is_active: true
})

const commonIcons = [
  { label: 'Carpeta', value: 'folder' },
  { label: 'Carpeta Abierta', value: 'folder_open' },
  { label: 'Carpeta Compartida', value: 'folder_shared' },
  { label: 'Documento', value: 'article' },
  { label: 'Descripción', value: 'description' },
  { label: 'PDF', value: 'picture_as_pdf' },
  { label: 'Asignación', value: 'assignment' },
  { label: 'Escuela/Educación', value: 'school' },
  { label: 'Libro', value: 'menu_book' },
  { label: 'Legal/Ley', value: 'gavel' },
  { label: 'Balance/Justicia', value: 'balance' },
  { label: 'Información', value: 'info' },
  { label: 'Ayuda', value: 'help' },
  { label: 'Evento', value: 'event' },
  { label: 'Destacado', value: 'star' },
  { label: 'Descarga', value: 'cloud_download' },
  { label: 'Archivo', value: 'archive' },
  { label: 'Reporte', value: 'assessment' },
  { label: 'Gráfico', value: 'analytics' },
  { label: 'Grupo', value: 'group' },
  { label: 'Persona', value: 'person' },
  { label: 'Biblioteca', value: 'local_library' },
  { label: 'Política', value: 'policy' },
  { label: 'Seguridad', value: 'security' }
]

const iconOptions = ref(commonIcons)

function filterIcons (val, update) {
  if (val === '') {
    update(() => {
      iconOptions.value = commonIcons
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    iconOptions.value = commonIcons.filter(v => 
      v.label.toLowerCase().indexOf(needle) > -1 || 
      v.value.toLowerCase().indexOf(needle) > -1
    )
  })
}

const columns = [
  { name: 'drag', label: 'Orden', field: 'drag', align: 'center', style: 'width: 80px' },
  { name: 'icon', label: 'Icono', field: 'icon', align: 'center', style: 'width: 60px' },
  { name: 'name', label: 'Nombre', field: 'name', sortable: true, align: 'left' },
  { name: 'description', label: 'Descripción', field: 'description', align: 'left' },
  { name: 'display_order', label: 'Pos.', field: 'display_order', sortable: true, align: 'center' },
  { name: 'is_active', label: 'Estado', field: 'is_active', sortable: true, align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

function truncateHtml(html, maxLength) {
  if (!html) return ''
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  const text = tmp.textContent || tmp.innerText || ''
  if (text.length <= maxLength) return html // Return original HTML if short enough
  return text.substring(0, maxLength) + '...'
}

async function fetchCategories() {
  loading.value = true
  try {
    const response = await api.get('/document-categories/all')
    categories.value = response.data
    orderChanged.value = false
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar categorías' })
  } finally {
    loading.value = false
  }
}

function openDialog(item = null) {
  if (item) {
    editedItem.value = { ...item }
  } else {
    // Find max order
    const maxOrder = categories.value.length > 0 
      ? Math.max(...categories.value.map(c => c.display_order || 0)) 
      : 0
      
    editedItem.value = {
      id: null,
      name: '',
      description: '',
      icon: 'folder',
      display_order: maxOrder + 1,
      is_active: true
    }
  }
  dialogOpen.value = true
}

async function saveCategory() {
  if (!editedItem.value.name) {
    $q.notify({ type: 'warning', message: 'El nombre es requerido' })
    return
  }

  saving.value = true
  try {
    if (editedItem.value.id) {
      await api.put(`/document-categories/${editedItem.value.id}`, editedItem.value)
      $q.notify({ type: 'positive', message: 'Categoría actualizada' })
    } else {
      await api.post('/document-categories', editedItem.value)
      $q.notify({ type: 'positive', message: 'Categoría creada' })
    }
    
    dialogOpen.value = false
    fetchCategories()
  } catch (error) {
    $q.notify({ 
      type: 'negative', 
      message: error.response?.data?.error || 'Error al guardar categoría' 
    })
  } finally {
    saving.value = false
  }
}

function confirmDelete(item) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar la categoría "${item.name}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/document-categories/${item.id}`)
      $q.notify({ type: 'positive', message: 'Categoría eliminada' })
      fetchCategories()
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al eliminar categoría'
      $q.dialog({
        title: 'Error',
        message: msg,
        color: 'negative'
      })
    }
  })
}

// Reordering functionality
function moveUp(index) {
  if (index === 0) return
  const items = [...categories.value]
  const temp = items[index]
  items[index] = items[index - 1]
  items[index - 1] = temp
  
  // Reassign display_order
  items.forEach((item, idx) => {
    item.display_order = idx + 1
  })
  
  categories.value = items
  orderChanged.value = true
}

function moveDown(index) {
  if (index === categories.value.length - 1) return
  const items = [...categories.value]
  const temp = items[index]
  items[index] = items[index + 1]
  items[index + 1] = temp
  
  // Reassign display_order
  items.forEach((item, idx) => {
    item.display_order = idx + 1
  })
  
  categories.value = items
  orderChanged.value = true
}

async function saveOrder() {
  savingOrder.value = true
  try {
    const orderData = categories.value.map(c => ({
      id: c.id,
      display_order: c.display_order
    }))
    
    await api.put('/document-categories/reorder', { categories: orderData })
    $q.notify({ type: 'positive', message: 'Orden actualizado' })
    orderChanged.value = false
    fetchCategories() 
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al guardar el orden' })
  } finally {
    savingOrder.value = false
  }
}

onMounted(fetchCategories)
</script>

<style scoped>
.drag-handle {
  cursor: grab;
}
.drag-handle:active {
  cursor: grabbing;
}
</style>
