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
      <h1 class="text-h4 q-my-none">Gestión de Sliders</h1>
      <q-btn color="primary" icon="add" label="Nuevo Slider" @click="openDialog()" />
    </div>

    <q-markup-table class="shadow-2" separator="cell">
      <table class="q-table">
        <thead>
          <tr>
            <th class="text-center" style="width: 40px"></th>
            <th class="text-center">Imagen</th>
            <th class="text-left">Título</th>
            <th class="text-left">Descripción</th>
            <th class="text-center">Orden</th>
            <th class="text-center">Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <VueDraggable 
          v-model="sliders" 
          tag="tbody" 
          @end="onDragEnd"
          handle=".drag-handle"
        >
          <tr v-for="row in sliders" :key="row.id">
              <td class="text-center">
                <q-icon name="drag_indicator" class="drag-handle cursor-move" size="sm" />
              </td>
              <td class="text-center">
                <q-avatar size="80px" square>
                  <img :src="getImageUrl(row.image_url)" :alt="row.title">
                </q-avatar>
              </td>
              <td class="text-left">{{ row.title }}</td>
              <td class="text-left">
                <div class="ellipsis" style="max-width: 300px" v-html="row.description"></div>
              </td>
              <td class="text-center">{{ row.display_order }}</td>
              <td class="text-center">
                <q-chip :color="row.is_active ? 'positive' : 'grey'" text-color="white" dense>
                  {{ row.is_active ? 'Activo' : 'Inactivo' }}
                </q-chip>
              </td>
              <td class="text-center">
                <div class="row justify-center q-gutter-xs">
                  <q-btn flat round color="info" icon="visibility" @click="openPreview(row)" size="sm" />
                  <q-btn flat round color="primary" icon="edit" @click="openDialog(row)" size="sm" />
                  <q-btn flat round color="negative" icon="delete" @click="confirmDelete(row)" size="sm" />
                </div>
              </td>
          </tr>
        </VueDraggable>
      </table>
    </q-markup-table>
    
    <div v-if="sliders.length === 0 && !loading" class="text-center q-pa-md text-grey">
      No hay sliders registrados
    </div>
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner color="primary" size="3em" />
    </div>

    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editedItem.id ? 'Editar Slider' : 'Nuevo Slider' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveSlider" class="q-gutter-md">
            <q-input 
              filled 
              v-model="editedItem.title" 
              label="Título *" 
              :rules="[val => !!val || 'Requerido']" 
            />
            
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-xs">Descripción</div>
              <RichTextEditor
                v-model="editedItem.description"
                :height="200"
              />
            </div>

            <q-input 
              filled 
              v-model="editedItem.link_url" 
              label="URL de Enlace" 
              placeholder="#sistemas"
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
              label="Activo" 
              color="primary"
            />

            <div class="q-gutter-sm">
              <div class="text-subtitle2">Imagen del Slider *</div>
              <q-file
                v-model="imageFile"
                filled
                accept="image/*"
                label="Seleccionar imagen"
                :rules="[val => editedItem.id || val || 'Imagen requerida para nuevo slider']"
              >
                <template v-slot:prepend>
                  <q-icon name="image" />
                </template>
              </q-file>
              
              <div v-if="editedItem.image_url && !imageFile" class="q-mt-sm">
                <div class="text-caption text-grey-7">Imagen actual:</div>
                <q-img 
                  :src="getImageUrl(editedItem.image_url)" 
                  style="max-width: 200px; max-height: 150px;"
                  class="rounded-borders q-mt-xs"
                />
              </div>

              <div v-if="imageFile" class="q-mt-sm">
                <div class="text-caption text-grey-7">Vista previa:</div>
                <q-img 
                  :src="previewUrl" 
                  style="max-width: 200px; max-height: 150px;"
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

    <!-- Preview Dialog -->
    <q-dialog v-model="previewOpen" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista Previa: {{ previewItem?.title }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-md">
          <div v-if="previewItem" style="max-width: 1200px; margin: 0 auto;">
            <q-img :src="getImageUrl(previewItem.image_url)" :alt="previewItem.title" />
            <div class="q-mt-md">
              <h3>{{ previewItem.title }}</h3>
              <div v-html="previewItem.description"></div>
              <p v-if="previewItem.link_url" class="q-mt-sm">
                <strong>Enlace:</strong> <a :href="previewItem.link_url">{{ previewItem.link_url }}</a>
              </p>
            </div>
          </div>
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
import RichTextEditor from '../../components/common/RichTextEditor.vue'
import { VueDraggable } from 'vue-draggable-plus'

const $q = useQuasar()
const loading = ref(false)
const saving = ref(false)
const sliders = ref([])
const dialogOpen = ref(false)
const previewOpen = ref(false)
const previewItem = ref(null)
const imageFile = ref(null)
const editedItem = ref({
  id: null,
  title: '',
  description: '',
  image_url: '',
  link_url: '',
  display_order: 0,
  is_active: true
})

const columns = [
  { name: 'drag', label: '', field: 'drag', align: 'center', style: 'width: 40px' },
  { name: 'image_url', label: 'Imagen', field: 'image_url', align: 'center' },
  { name: 'title', label: 'Título', field: 'title', sortable: true, align: 'left' },
  { name: 'description', label: 'Descripción', field: 'description', align: 'left' },
  { name: 'display_order', label: 'Orden', field: 'display_order', sortable: true, align: 'center' },
  { name: 'is_active', label: 'Estado', field: 'is_active', sortable: true, align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

const previewUrl = computed(() => {
  if (imageFile.value) {
    return URL.createObjectURL(imageFile.value)
  }
  return null
})

function getImageUrl(url) {
  if (!url) return '/assets/images/placeholder.png'
  return getResourceUrl(url)
}

async function fetchSliders() {
  loading.value = true
  try {
    const response = await api.get('/sliders')
    sliders.value = response.data
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar sliders' })
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
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      display_order: sliders.value.length,
      is_active: true
    }
  }
  imageFile.value = null
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
  imageFile.value = null
}

async function saveSlider() {
  saving.value = true
  try {
    const formData = new FormData()
    formData.append('title', editedItem.value.title)
    formData.append('description', editedItem.value.description || '')
    formData.append('link_url', editedItem.value.link_url || '')
    formData.append('display_order', String(editedItem.value.display_order))
    formData.append('is_active', String(editedItem.value.is_active))
    
    if (imageFile.value) {
      formData.append('image', imageFile.value)
    }

    if (editedItem.value.id) {
      await api.put(`/sliders/${editedItem.value.id}`, formData)
      $q.notify({ type: 'positive', message: 'Slider actualizado' })
    } else {
      await api.post('/sliders', formData)
      $q.notify({ type: 'positive', message: 'Slider creado' })
    }
    
    closeDialog()
    fetchSliders()
  } catch (error) {
    $q.notify({ 
      type: 'negative', 
      message: error.response?.data?.error || 'Error al guardar slider' 
    })
  } finally {
    saving.value = false
  }
}

function confirmDelete(item) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar slider "${item.title}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/sliders/${item.id}`)
      $q.notify({ type: 'positive', message: 'Slider eliminado', icon: 'check' })
      fetchSliders()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar slider', icon: 'error' })
    }
  })
}

async function onDragEnd() {
  try {
    const reorderedSliders = sliders.value.map((slider, index) => ({
      id: slider.id,
      display_order: index
    }))
    
    await api.post('/sliders/reorder', { sliders: reorderedSliders })
    $q.notify({ 
      type: 'positive', 
      message: 'Orden actualizado correctamente',
      icon: 'check'
    })
    fetchSliders()
  } catch (error) {
    $q.notify({ 
      type: 'negative', 
      message: 'Error al actualizar el orden',
      icon: 'error'
    })
    fetchSliders() // Reload to reset order
  }
}

function openPreview(item) {
  previewItem.value = item
  previewOpen.value = true
}

onMounted(fetchSliders)
</script>
