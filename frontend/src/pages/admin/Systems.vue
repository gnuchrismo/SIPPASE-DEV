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
      <h1 class="text-h4 q-my-none">Gestión de Sistemas</h1>
      <q-btn color="primary" icon="add" label="Nuevo Sistema" @click="openDialog()" />
    </div>

    <q-banner v-if="systems.length === 0" class="bg-warning text-white q-mb-md">
      No hay sistemas registrados.
    </q-banner>

    <q-list bordered separator class="rounded-borders shadow-2 bg-white">
      <q-item-label header class="bg-grey-2 text-bold row">
        <div class="col-auto text-center" style="width: 40px"></div>
        <div class="col-1 text-center">Ícono</div>
        <div class="col-3">Nombre</div>
        <div class="col-3">URL</div>
        <div class="col-2 text-center">Estado</div>
        <div class="col-1 text-center">Orden</div>
        <div class="col-1 text-center">Acciones</div>
      </q-item-label>

      <VueDraggable 
        v-model="systems"
        @end="onDragEnd"
        handle=".drag-handle"
        class="q-list-container"
      >
        <q-item v-for="system in systems" :key="system.id" class="q-py-md hover-bg-grey-1">
            <q-item-section avatar style="width: 40px; min-width: 40px;">
              <q-icon name="drag_indicator" class="drag-handle cursor-move" size="sm" />
            </q-item-section>

            <q-item-section avatar class="col-1 flex-center">
              <q-avatar square size="40px">
                <img :src="getIconUrl(system.icon_url)" :alt="system.name">
              </q-avatar>
            </q-item-section>

            <q-item-section class="col-3">
              <q-item-label class="text-bold">{{ system.name }}</q-item-label>
              <q-item-label caption lines="2">{{ system.description }}</q-item-label>
            </q-item-section>

            <q-item-section class="col-3">
              <q-item-label v-if="system.url">
                <a :href="system.url" target="_blank" class="text-primary" @click.stop>{{ system.url }}</a>
              </q-item-label>
              <q-item-label v-else caption>Sin URL</q-item-label>
              
              <q-item-label v-if="system.manual_url" caption>
                <q-icon name="description" size="xs" /> 
                <a :href="system.manual_url" target="_blank" class="text-grey-7" @click.stop>Manual</a>
              </q-item-label>
            </q-item-section>

            <q-item-section class="col-2 flex-center">
              <q-toggle
                v-model="system.is_active"
                color="positive"
                @update:model-value="toggleActive(system)"
              />
            </q-item-section>

            <q-item-section class="col-1 flex-center">
              <q-chip size="sm" color="grey-3">{{ system.display_order }}</q-chip>
            </q-item-section>

            <q-item-section class="col-1 flex-center row justify-center">
              <div class="row no-wrap">
                <q-btn flat round color="primary" icon="edit" @click.stop="openDialog(system)" size="sm" />
                <q-btn flat round color="negative" icon="delete" @click.stop="confirmDelete(system)" size="sm" />
              </div>
            </q-item-section>
        </q-item>
      </VueDraggable>
    </q-list>

    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editedItem.id ? 'Editar Sistema' : 'Nuevo Sistema' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveSystem" class="q-gutter-md">
            <q-input 
              filled 
              v-model="editedItem.name" 
              label="Nombre del Sistema *" 
              :rules="[val => !!val || 'Requerido']" 
            />
            
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">Descripción</div>
              <RichTextEditor 
                v-model="editedItem.description" 
                :height="200"
              />
            </div>

            <q-input 
              filled 
              v-model="editedItem.url" 
              label="URL del Sistema" 
              placeholder="https://sistema.sippase.gob.bo"
            />

            <q-input 
              filled 
              v-model="editedItem.manual_url" 
              label="URL del Manual" 
              placeholder="https://manual.sippase.gob.bo/sistema.pdf"
            />

            <q-input 
              filled 
              v-model.number="editedItem.display_order" 
              label="Orden de Visualización" 
              type="number"
              min="0"
            />

            <q-toggle
              v-model="editedItem.is_active"
              label="Sistema Activo"
              color="positive"
            />

            <div class="q-gutter-sm">
              <div class="text-subtitle2">Ícono del Sistema</div>
              <q-file
                v-model="iconFile"
                filled
                accept="image/*"
                label="Seleccionar ícono"
                :rules="[val => editedItem.id || val || 'Ícono requerido para nuevo sistema']"
              >
                <template v-slot:prepend>
                  <q-icon name="image" />
                </template>
              </q-file>
              
              <div v-if="editedItem.icon_url && !iconFile" class="q-mt-sm">
                <div class="text-caption text-grey-7">Ícono actual:</div>
                <q-img 
                  :src="getIconUrl(editedItem.icon_url)" 
                  style="max-width: 100px; max-height: 100px;"
                  class="rounded-borders q-mt-xs"
                />
              </div>

              <div v-if="iconFile" class="q-mt-sm">
                <div class="text-caption text-grey-7">Vista previa:</div>
                <q-img 
                  :src="previewUrl" 
                  style="max-width: 100px; max-height: 100px;"
                  class="rounded-borders q-mt-xs"
                />
              </div>
            </div>

            <div class="row justify-end q-mt-md q-gutter-sm">
              <q-btn label="Cancelar" color="grey-7" flat @click="closeDialog" />
              <q-btn label="Guardar" type="submit" color="primary" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../../boot/axios'
import { getResourceUrl } from '../../utils/urlHelper'
import { useQuasar } from 'quasar'
import { VueDraggable } from 'vue-draggable-plus'
import RichTextEditor from '../../components/common/RichTextEditor.vue'

const $q = useQuasar()
const loading = ref(false)
const saving = ref(false)
const systems = ref([])
const dialogOpen = ref(false)
const iconFile = ref(null)
const editedItem = ref({
  id: null,
  name: '',
  description: '',
  icon_url: '',
  url: '',
  manual_url: '',
  display_order: 0,
  is_active: true
})

const previewUrl = computed(() => {
  if (iconFile.value) {
    return URL.createObjectURL(iconFile.value)
  }
  return null
})

function getIconUrl(url) {
  if (!url) return '/assets/svg/shield.svg'
  return getResourceUrl(url)
}

async function fetchSystems() {
  loading.value = true
  try {
    const response = await api.get('/systems')
    systems.value = response.data
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar sistemas', icon: 'error' })
  } finally {
    loading.value = false
  }
}

function openDialog(item = null) {
  if (item) {
    editedItem.value = { ...item }
  } else {
    editedItem.value = {
      id: null,
      name: '',
      description: '',
      icon_url: '',
      url: '',
      manual_url: '',
      display_order: systems.value.length,
      is_active: true
    }
  }
  iconFile.value = null
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
  iconFile.value = null
}

async function saveSystem() {
  saving.value = true
  try {
    const formData = new FormData()
    formData.append('name', editedItem.value.name)
    formData.append('description', editedItem.value.description || '')
    formData.append('url', editedItem.value.url || '')
    formData.append('manual_url', editedItem.value.manual_url || '')
    formData.append('display_order', editedItem.value.display_order)
    formData.append('is_active', editedItem.value.is_active)
    
    if (iconFile.value) {
      formData.append('icon', iconFile.value)
    }

    if (editedItem.value.id) {
      await api.put(`/systems/${editedItem.value.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      $q.notify({ type: 'positive', message: 'Sistema actualizado', icon: 'check' })
    } else {
      await api.post('/systems', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      $q.notify({ type: 'positive', message: 'Sistema creado', icon: 'check' })
    }
    
    closeDialog()
    fetchSystems()
  } catch (error) {
    $q.notify({ 
      type: 'negative', 
      message: error.response?.data?.error || 'Error al guardar sistema',
      icon: 'error'
    })
  } finally {
    saving.value = false
  }
}

function confirmDelete(item) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar sistema "${item.name}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/systems/${item.id}`)
      $q.notify({ type: 'positive', message: 'Sistema eliminado', icon: 'check' })
      fetchSystems()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar sistema', icon: 'error' })
    }
  })
}

async function toggleActive(system) {
  try {
    const formData = new FormData()
    formData.append('name', system.name)
    formData.append('description', system.description || '')
    formData.append('url', system.url || '')
    formData.append('manual_url', system.manual_url || '')
    formData.append('display_order', system.display_order)
    formData.append('is_active', system.is_active)
    
    // Append existing icon path if no new file (backend handles this logic but good to be safe)
    // Actually backend checks if file is present. If not, it keeps old one.
    
    await api.put(`/systems/${system.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    $q.notify({ 
      type: 'positive', 
      message: `Sistema ${system.is_active ? 'activado' : 'desactivado'}`,
      icon: 'check' 
    })
  } catch (error) {
    system.is_active = !system.is_active // Revert change
    $q.notify({ type: 'negative', message: 'Error al actualizar estado', icon: 'error' })
  }
}

async function onDragEnd() {
  try {
    const reorderedSystems = systems.value.map((system, index) => ({
      id: system.id,
      display_order: index
    }))
    
    await api.post('/systems/reorder', { systems: reorderedSystems })
    $q.notify({ 
      type: 'positive', 
      message: 'Orden actualizado correctamente',
      icon: 'check'
    })
    fetchSystems()
  } catch (error) {
    $q.notify({ 
      type: 'negative', 
      message: 'Error al actualizar el orden',
      icon: 'error'
    })
    fetchSystems() // Reload to reset order
  }
}

onMounted(fetchSystems)
</script>
