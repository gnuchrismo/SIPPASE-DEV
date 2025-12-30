<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <h1 class="text-h4 q-my-none">Documentos y Recursos</h1>
      <div class="row q-gutter-sm">
        <q-btn 
          color="secondary" 
          icon="category" 
          label="Gestionar Categorías" 
          @click="$router.push('/admin/document-categories')" 
          outline
        />
        <q-btn color="primary" icon="add" label="Nuevo Documento" @click="openDialog()" />
      </div>
    </div>

    <q-table
      :rows="documents"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :filter="filter"
      class="shadow-2"
    >
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:body-cell-description="props">
        <q-td :props="props">
          <div class="ellipsis" style="max-width: 300px" v-html="truncateHtml(props.row.description, 100)"></div>
        </q-td>
      </template>

      <template v-slot:body-cell-file_type="props">
        <q-td :props="props">
          <q-chip :color="getFileTypeColor(props.row.file_type)" text-color="white" dense>
            {{ props.row.file_type }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round color="primary" icon="download" @click="downloadDocument(props.row)" size="sm" title="Descargar" />
          <q-btn flat round color="primary" icon="edit" @click="openDialog(props.row)" size="sm" />
          <q-btn flat round color="negative" icon="delete" @click="confirmDelete(props.row)" size="sm" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogOpen" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="column">
        <q-toolbar class="bg-primary text-white">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title>{{ editedItem.id ? 'Editar Documento' : 'Nuevo Documento' }}</q-toolbar-title>
          <q-btn flat label="Guardar" @click="saveDocument" :loading="saving" />
        </q-toolbar>

        <q-card-section class="col q-pt-none scroll">
          <div class="q-pa-md" style="max-width: 800px; margin: 0 auto;">
            <q-form @submit="saveDocument" class="q-gutter-md q-mt-md">
              <q-input 
                filled 
                v-model="editedItem.title" 
                label="Título del Documento *" 
                :rules="[val => !!val || 'Requerido']" 
              />
              
              <div class="q-my-md">
                <div class="text-subtitle2 q-mb-sm">Descripción</div>
                <RichTextEditor v-model="editedItem.description" :height="300" />
              </div>

              <q-select
                filled
                v-model="editedItem.category"
                :options="categories"
                label="Categoría *"
                :rules="[val => !!val || 'Categoría requerida']"
                option-value="name"
                option-label="name"
                emit-value
                map-options
              />

              <div class="q-gutter-sm">
                <div class="text-subtitle2">Archivo *</div>
                <q-file
                  v-model="documentFile"
                  filled
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                  label="Seleccionar archivo"
                  :rules="[val => editedItem.id || val || 'Archivo requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
                
                <div v-if="editedItem.file_url && !documentFile" class="q-mt-sm">
                  <div class="text-caption text-grey-7">Archivo actual:</div>
                  <div class="text-body2 q-mt-xs">
                    <q-chip color="primary" text-color="white">
                      {{ editedItem.file_type }} - {{ editedItem.file_size }}
                    </q-chip>
                  </div>
                </div>

                <div v-if="documentFile" class="q-mt-sm">
                  <div class="text-caption text-grey-7">Archivo seleccionado:</div>
                  <div class="text-body2 q-mt-xs">{{ documentFile.name }}</div>
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
import { ref, onMounted, onActivated } from 'vue'
import { api } from '../../boot/axios'
import { getResourceUrl } from '../../utils/urlHelper'
import { useQuasar } from 'quasar'
import RichTextEditor from '../../components/common/RichTextEditor.vue'

const $q = useQuasar()
const loading = ref(false)
const saving = ref(false)
const documents = ref([])
const dialogOpen = ref(false)
const documentFile = ref(null)
const filter = ref('')
const categories = ref([])
const editedItem = ref({
  id: null,
  title: '',
  description: '',
  file_url: '',
  file_type: '',
  file_size: '',
  category: ''
})

const columns = [
  { name: 'title', label: 'Título', field: 'title', sortable: true, align: 'left' },
  { name: 'category', label: 'Categoría', field: 'category', sortable: true, align: 'left' },
  { name: 'description', label: 'Descripción', field: 'description', align: 'left' },
  { name: 'file_type', label: 'Tipo', field: 'file_type', sortable: true, align: 'center' },
  { name: 'file_size', label: 'Tamaño', field: 'file_size', sortable: true, align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

function getFileTypeColor(type) {
  const colors = {
    'PDF': 'red',
    'DOC': 'blue',
    'DOCX': 'blue',
    'XLS': 'green',
    'XLSX': 'green',
    'ZIP': 'purple'
  }
  return colors[type] || 'grey'
}

function truncateHtml(html, maxLength) {
  if (!html) return ''
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  const text = tmp.textContent || tmp.innerText || ''
  if (text.length <= maxLength) return html
  return text.substring(0, maxLength) + '...'
}

async function fetchCategories() {
  try {
    const response = await api.get('/document-categories/all')
    categories.value = response.data.map(c => c.name)
  } catch (error) {
    console.error('Error fetching categories', error)
    $q.notify({ type: 'warning', message: 'No se pudieron cargar las categorías' })
  }
}

async function fetchDocuments() {
  loading.value = true
  try {
    const response = await api.get('/documents')
    documents.value = response.data
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar documentos' })
  } finally {
    loading.value = false
  }
}

async function openDialog(item = null) {
  // Refresh categories to get any newly added ones
  await fetchCategories()
  
  if (item) {
    editedItem.value = { ...item }
  } else {
    editedItem.value = {
      id: null,
      title: '',
      description: '',
      file_url: '',
      file_type: '',
      file_size: '',
      category: categories.value.length > 0 ? categories.value[0] : ''
    }
  }
  documentFile.value = null
  dialogOpen.value = true
}

async function saveDocument() {
  saving.value = true
  try {
    const formData = new FormData()
    formData.append('title', editedItem.value.title)
    formData.append('description', editedItem.value.description || '')
    formData.append('category', editedItem.value.category)
    
    if (documentFile.value) {
      formData.append('file', documentFile.value)
    }

    if (editedItem.value.id) {
      await api.put(`/documents/${editedItem.value.id}`, formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      })
      $q.notify({ type: 'positive', message: 'Documento actualizado' })
    } else {
      await api.post('/documents', formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      })
      $q.notify({ type: 'positive', message: 'Documento creado' })
    }
    
    dialogOpen.value = false
    fetchDocuments()
  } catch (error) {
    $q.notify({ 
      type: 'negative', 
      message: error.response?.data?.error || 'Error al guardar documento' 
    })
  } finally {
    saving.value = false
  }
}

function downloadDocument(item) {
  window.open(getResourceUrl(item.file_url), '_blank')
}

function confirmDelete(item) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar documento "${item.title}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/documents/${item.id}`)
      $q.notify({ type: 'positive', message: 'Documento eliminado' })
      fetchDocuments()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar documento' })
    }
  })
}

onMounted(() => {
  fetchCategories()
  fetchDocuments()
})

// Refresh categories when returning to this page (e.g., from category manager)
onActivated(() => {
  fetchCategories()
})
</script>
