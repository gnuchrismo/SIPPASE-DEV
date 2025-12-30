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
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" full-width>
    <q-card class="column full-height" style="max-height: 80vh">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Seleccionar Imagen</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="col q-pa-md">
        <div class="row q-col-gutter-md full-height">
          <!-- Sidebar -->
          <div class="col-12 col-md-3">
             <q-input 
              dense 
              outlined 
              v-model="searchQuery" 
              placeholder="Buscar..." 
              class="q-mb-md"
              debounce="500"
              @update:model-value="loadFiles(1)"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-list bordered separator class="rounded-borders">
              <q-item 
                clickable 
                v-ripple 
                :active="activeFolder === null" 
                @click="filterByFolder(null)"
                active-class="bg-primary text-white"
              >
                <q-item-section avatar><q-icon name="folder" /></q-item-section>
                <q-item-section>Todas</q-item-section>
              </q-item>
              
              <q-item 
                v-for="folder in folders" 
                :key="folder.folder" 
                clickable 
                v-ripple 
                :active="activeFolder === folder.folder"
                @click="filterByFolder(folder.folder)"
                active-class="bg-primary text-white"
              >
                <q-item-section avatar><q-icon name="folder_open" /></q-item-section>
                <q-item-section>{{ folder.folder }}</q-item-section>
              </q-item>
            </q-list>
            
            <q-btn 
              color="primary" 
              class="full-width q-mt-md" 
              label="Subir Imagen" 
              icon="cloud_upload" 
              @click="uploadDialog = true"
            />
          </div>

          <!-- Grid -->
          <div class="col-12 col-md-9 scroll">
            <div v-if="loading" class="row justify-center q-pa-xl">
              <q-spinner color="primary" size="3em" />
            </div>

            <div v-else-if="files.length === 0" class="text-center q-pa-xl text-grey">
              <q-icon name="image_not_supported" size="4em" />
              <div class="text-h6 q-mt-md">No se encontraron imágenes</div>
            </div>

            <div v-else class="row q-col-gutter-sm">
              <div class="col-6 col-sm-4 col-md-3" v-for="file in files" :key="file.id">
                <q-card 
                  class="cursor-pointer relative-position" 
                  @click="selectFile(file)"
                  :class="{ 'selected-card': selectedFile?.id === file.id }"
                >
                  <q-img 
                    :src="getFileUrl(file.path)" 
                    :ratio="1"
                    class="bg-grey-2"
                  >
                    <template v-slot:error>
                      <div class="absolute-full flex flex-center bg-negative text-white">Error</div>
                    </template>
                  </q-img>
                  <div class="absolute-bottom text-subtitle2 text-white bg-black-transparent q-pa-xs text-truncate">
                    {{ file.original_name }}
                  </div>
                  <div v-if="selectedFile?.id === file.id" class="absolute-full flex flex-center selected-overlay">
                    <q-icon name="check_circle" color="white" size="3em" />
                  </div>
                </q-card>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="pagination.totalPages > 1" class="row justify-center q-mt-md">
              <q-pagination
                v-model="currentPage"
                :max="pagination.totalPages"
                :max-pages="5"
                direction-links
                @update:model-value="loadFiles"
                color="primary"
                dense
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="bg-grey-1">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn color="primary" label="Seleccionar" :disable="!selectedFile" @click="confirmSelection" />
      </q-card-actions>
    </q-card>

    <!-- Upload Dialog -->
    <q-dialog v-model="uploadDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Subir Imagen</div>
        </q-card-section>
        <q-card-section>
          <q-file
            v-model="fileToUpload"
            label="Seleccionar imagen"
            filled
            accept="image/*"
            :rules="[val => !!val || 'Archivo requerido']"
          >
            <template v-slot:prepend><q-icon name="attach_file" /></template>
          </q-file>
          <q-select
            v-model="targetFolder"
            label="Carpeta"
            filled
            :options="folderOptions"
            use-input
            new-value-mode="add-unique"
            class="q-mt-md"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Subir" @click="uploadFile" :loading="uploading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { api } from '../../boot/axios'
import { getResourceUrl } from '../../utils/urlHelper'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'select'])

const $q = useQuasar()
const files = ref([])
const folders = ref([])
const loading = ref(false)
const searchQuery = ref('')
const activeFolder = ref(null)
const selectedFile = ref(null)
const currentPage = ref(1)
const pagination = ref({ page: 1, limit: 20, totalPages: 0 })

const uploadDialog = ref(false)
const fileToUpload = ref(null)
const targetFolder = ref('default')
const uploading = ref(false)

const folderOptions = computed(() => folders.value.map(f => f.folder))

// Watch for dialog open - use nextTick to avoid lifecycle hook issues
watch(() => props.modelValue, (val) => {
  if (val) {
    // Reset state first (synchronously)
    selectedFile.value = null
    // Then load data in nextTick to avoid lifecycle warnings
    nextTick(() => {
      loadFiles(1)
      loadFolders()
    })
  }
})

const loadFiles = async (page = 1) => {
  loading.value = true
  currentPage.value = page
  try {
    const params = {
      page,
      limit: 20,
      type: 'image', // Only images
      sortBy: 'created_at',
      sortOrder: 'DESC'
    }
    if (activeFolder.value) params.folder = activeFolder.value
    if (searchQuery.value) params.search = searchQuery.value

    const response = await api.get('/media', { params })
    files.value = response.data.items || []
    pagination.value = response.data.pagination || pagination.value
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadFolders = async () => {
  try {
    const response = await api.get('/media/folders')
    folders.value = response.data || []
  } catch (error) {
    console.error(error)
  }
}

const filterByFolder = (folder) => {
  activeFolder.value = folder
  loadFiles(1)
}

const selectFile = (file) => {
  selectedFile.value = file
}

const confirmSelection = () => {
  if (selectedFile.value) {
    emit('select', getFileUrl(selectedFile.value.path))
    emit('update:modelValue', false)
  }
}

const getFileUrl = (path) => {
  if (!path) return ''
  return getResourceUrl(path)
}

const uploadFile = async () => {
  if (!fileToUpload.value) return
  uploading.value = true
  
  const formData = new FormData()
  formData.append('file', fileToUpload.value)
  formData.append('folder', targetFolder.value || 'default')
  
  try {
    await api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    $q.notify({ type: 'positive', message: 'Imagen subida' })
    uploadDialog.value = false
    fileToUpload.value = null
    loadFiles(1)
    loadFolders()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al subir imagen' })
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.bg-black-transparent {
  background: rgba(0, 0, 0, 0.6);
}
.selected-card {
  border: 2px solid var(--q-primary);
}
.selected-overlay {
  background: rgba(var(--q-primary-rgb), 0.4);
}
</style>
