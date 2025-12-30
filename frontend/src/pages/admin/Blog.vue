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
      <h1 class="text-h4 q-my-none">📰 Blog / Noticias</h1>
      <q-btn color="primary" icon="add" label="Nueva Publicación" @click="openDialog()" />
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-input 
            dense 
            outlined 
            v-model="filter.search" 
            placeholder="Buscar por título..."
            debounce="300"
            @update:model-value="fetchPosts"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-3">
          <q-select
            dense
            outlined
            v-model="filter.status"
            :options="statusOptions"
            label="Estado"
            clearable
            @update:model-value="fetchPosts"
          />
        </div>
        <div class="col-12 col-md-3">
          <q-select
            dense
            outlined
            v-model="filter.category"
            :options="categories"
            label="Categoría"
            clearable
            @update:model-value="fetchPosts"
          />
        </div>
        <div class="col-12 col-md-2">
          <q-btn 
            outline 
            color="primary" 
            icon="refresh" 
            label="Actualizar" 
            @click="fetchPosts" 
            class="full-width"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Posts Table -->
    <q-card flat bordered>
      <q-table
        :rows="posts"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        :pagination="pagination"
        @request="onRequest"
      >
        <template v-slot:body-cell-featured_image_url="props">
          <q-td :props="props">
            <q-avatar v-if="props.row.featured_image_url" rounded size="60px">
              <img :src="getImageUrl(props.row.featured_image_url)" />
            </q-avatar>
            <q-icon v-else name="image" size="40px" color="grey-5" />
          </q-td>
        </template>

        <template v-slot:body-cell-title="props">
          <q-td :props="props">
            <div class="text-weight-bold">{{ props.row.title }}</div>
            <div class="text-caption text-grey-7">{{ props.row.slug }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-category="props">
          <q-td :props="props">
            <q-chip :color="getCategoryColor(props.row.category)" text-color="white" dense>
              {{ props.row.category }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip 
              :color="props.row.status === 'published' ? 'positive' : 'grey'" 
              text-color="white" 
              dense
              :icon="props.row.status === 'published' ? 'check_circle' : 'edit'"
            >
              {{ props.row.status === 'published' ? 'Publicado' : 'Borrador' }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-media_count="props">
          <q-td :props="props">
            <q-badge v-if="props.row.media_count > 0" color="primary">
              {{ props.row.media_count }}
            </q-badge>
            <span v-else class="text-grey-5">0</span>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round color="primary" icon="edit" @click="openDialog(props.row)" size="sm" title="Editar">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round color="info" icon="attach_file" @click="openMediaDialog(props.row)" size="sm" title="Medios">
              <q-tooltip>Gestionar Medios</q-tooltip>
            </q-btn>
            <q-btn flat round color="negative" icon="delete" @click="confirmDelete(props.row)" size="sm" title="Eliminar">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="dialogOpen" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6">{{ editedItem.id ? 'Editar Publicación' : 'Nueva Publicación' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md scroll" style="max-height: calc(100vh - 120px)">
          <q-form @submit="savePost" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <!-- Left Column -->
              <div class="col-12 col-md-8">
                <q-input 
                  filled 
                  v-model="editedItem.title" 
                  label="Título *" 
                  :rules="[val => !!val || 'El título es requerido']"
                  counter
                  maxlength="200"
                />

                <div class="q-mb-md">
                  <div class="text-subtitle2 q-mb-sm">Resumen</div>
                  <RichTextEditor
                    v-model="editedItem.summary"
                    :height="150"
                  />
                  <div class="text-caption text-grey q-mt-xs text-right">
                    {{ editedItem.summary ? editedItem.summary.length : 0 }} / 300 caracteres
                  </div>
                </div>

                <div class="q-mt-md">
                  <div class="text-subtitle2 q-mb-sm">Contenido *</div>
                  <RichTextEditor
                    v-model="editedItem.content"
                    :height="400"
                  />
                </div>
              </div>

              <!-- Right Column -->
              <div class="col-12 col-md-4">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle2 q-mb-md">Configuración</div>

                    <q-select
                      filled
                      v-model="editedItem.category"
                      :options="categories"
                      label="Categoría *"
                      :rules="[val => !!val || 'La categoría es requerida']"
                    />

                    <q-select
                      filled
                      v-model="editedItem.status"
                      :options="statusOptions"
                      label="Estado *"
                      emit-value
                      map-options
                      :rules="[val => !!val || 'El estado es requerido']"
                      class="q-mt-md"
                    >
                      <template v-slot:prepend>
                        <q-icon :name="editedItem.status === 'published' ? 'check_circle' : 'edit'" />
                      </template>
                    </q-select>

                    <div class="q-mt-md">
                      <div class="text-subtitle2 q-mb-sm">Imagen Destacada</div>
                      <q-file
                        v-model="featuredImage"
                        filled
                        accept="image/*"
                        label="Seleccionar imagen"
                        @update:model-value="previewImage"
                      >
                        <template v-slot:prepend>
                          <q-icon name="image" />
                        </template>
                      </q-file>

                      <div v-if="imagePreview || editedItem.featured_image_url" class="q-mt-md">
                        <img 
                          :src="imagePreview || getImageUrl(editedItem.featured_image_url)" 
                          class="full-width rounded-borders"
                          style="max-height: 200px; object-fit: cover;"
                        />
                        <q-btn 
                          v-if="imagePreview" 
                          flat 
                          dense 
                          color="negative" 
                          icon="close" 
                          label="Quitar" 
                          @click="removeImage"
                          class="q-mt-sm full-width"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <div class="row justify-end q-mt-md q-gutter-sm">
              <q-btn label="Cancelar" color="grey-7" flat @click="closeDialog" />
              <q-btn label="Guardar" type="submit" color="primary" :loading="saving" icon="save" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Media Management Dialog -->
    <q-dialog v-model="mediaDialogOpen" persistent>
      <q-card style="min-width: 700px; max-width: 900px">
        <q-card-section class="row items-center q-pb-none bg-info text-white">
          <div class="text-h6">Gestionar Medios - {{ currentPost?.title }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-tabs v-model="mediaTab" dense class="text-grey" active-color="primary" indicator-color="primary">
            <q-tab name="list" label="Medios Adjuntos" icon="list" />
            <q-tab name="add" label="Agregar Medio" icon="add" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="mediaTab" animated>
            <!-- Media List -->
            <q-tab-panel name="list">
              <div v-if="postMedia.length === 0" class="text-center q-pa-md text-grey-7">
                <q-icon name="inbox" size="64px" />
                <div class="q-mt-md">No hay medios adjuntos</div>
              </div>

              <q-list v-else bordered separator>
                <q-item v-for="media in postMedia" :key="media.id">
                  <q-item-section avatar>
                    <q-icon 
                      :name="getMediaIcon(media.media_type)" 
                      :color="getMediaColor(media.media_type)" 
                      size="32px"
                    />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ media.media_title || media.title || 'Sin título' }}</q-item-label>
                    <q-item-label caption>
                      <q-chip dense size="sm" :color="getMediaColor(media.media_type)" text-color="white">
                        {{ media.media_type }}
                      </q-chip>
                      {{ media.description }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-btn flat round color="negative" icon="delete" @click="removeMedia(media)" size="sm" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>

            <!-- Add Media -->
            <q-tab-panel name="add">
              <q-form @submit="addMedia" class="q-gutter-md">
                <q-select
                  filled
                  v-model="newMedia.media_type"
                  :options="mediaTypeOptions"
                  label="Tipo de Medio *"
                  emit-value
                  map-options
                />

                <!-- Document Selector -->
                <div v-if="newMedia.media_type === 'document'">
                  <q-select
                    filled
                    v-model="newMedia.media_id"
                    :options="documents"
                    option-value="id"
                    option-label="title"
                    label="Seleccionar Documento *"
                    emit-value
                    map-options
                    :loading="loadingDocuments"
                  >
                    <template v-slot:prepend>
                      <q-icon name="description" />
                    </template>
                  </q-select>
                </div>

                <!-- Video Selector -->
                <div v-if="newMedia.media_type === 'video'">
                  <q-select
                    filled
                    v-model="newMedia.media_id"
                    :options="videos"
                    option-value="id"
                    option-label="original_name"
                    label="Seleccionar Video *"
                    emit-value
                    map-options
                    :loading="loadingVideos"
                  >
                    <template v-slot:prepend>
                      <q-icon name="videocam" />
                    </template>
                  </q-select>
                </div>

                <!-- YouTube URL -->
                <div v-if="newMedia.media_type === 'youtube'">
                  <q-input
                    filled
                    v-model="newMedia.youtube_url"
                    label="URL de YouTube *"
                    placeholder="https://www.youtube.com/watch?v=..."
                    :rules="[val => !!val || 'La URL es requerida']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="smart_display" />
                    </template>
                  </q-input>

                  <div v-if="youtubePreview" class="q-mt-md">
                    <div class="text-caption q-mb-sm">Vista Previa:</div>
                    <div class="video-container">
                      <iframe
                        :src="youtubePreview"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                      ></iframe>
                    </div>
                  </div>
                </div>

                <q-input
                  filled
                  v-model="newMedia.title"
                  label="Título (opcional)"
                />

                <q-input
                  filled
                  v-model="newMedia.description"
                  label="Descripción (opcional)"
                  type="textarea"
                  rows="2"
                />

                <div class="row justify-end q-gutter-sm">
                  <q-btn label="Cancelar" flat @click="resetMediaForm" />
                  <q-btn label="Agregar" type="submit" color="primary" :loading="addingMedia" />
                </div>
              </q-form>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { api } from '../../boot/axios'
import { getResourceUrl } from '../../utils/urlHelper'
import { useQuasar } from 'quasar'
import RichTextEditor from '../../components/common/RichTextEditor.vue'

const $q = useQuasar()
const loading = ref(false)
const saving = ref(false)
const posts = ref([])
const dialogOpen = ref(false)
const mediaDialogOpen = ref(false)
const featuredImage = ref(null)
const imagePreview = ref(null)
const filter = ref({
  search: '',
  status: null,
  category: null
})

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const editedItem = ref({
  id: null,
  title: '',
  summary: '',
  content: '',
  category: 'Noticias',
  status: 'draft',
  featured_image_url: ''
})

const categories = ref(['Noticias', 'Eventos', 'Comunicados', 'Capacitación', 'Informes'])
const statusOptions = [
  { label: 'Borrador', value: 'draft' },
  { label: 'Publicado', value: 'published' }
]

const mediaTab = ref('list')
const currentPost = ref(null)
const postMedia = ref([])
const addingMedia = ref(false)
const loadingDocuments = ref(false)
const loadingVideos = ref(false)
const documents = ref([])
const videos = ref([])

const newMedia = ref({
  media_type: 'document',
  media_id: null,
  youtube_url: '',
  title: '',
  description: ''
})

const mediaTypeOptions = [
  { label: 'Documento', value: 'document' },
  { label: 'Video', value: 'video' },
  { label: 'YouTube', value: 'youtube' }
]

const columns = [
  { name: 'featured_image_url', label: 'Imagen', field: 'featured_image_url', align: 'center' },
  { name: 'title', label: 'Título', field: 'title', sortable: true, align: 'left' },
  { name: 'category', label: 'Categoría', field: 'category', sortable: true, align: 'center' },
  { name: 'status', label: 'Estado', field: 'status', sortable: true, align: 'center' },
  { name: 'media_count', label: 'Medios', field: 'media_count', sortable: true, align: 'center' },
  { name: 'created_at', label: 'Fecha', field: 'created_at', sortable: true, align: 'center',
    format: val => new Date(val).toLocaleDateString() },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

const youtubePreview = computed(() => {
  if (!newMedia.value.youtube_url) return null
  const videoId = extractYouTubeId(newMedia.value.youtube_url)
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null
})

function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

function getCategoryColor(category) {
  const colors = {
    'Noticias': 'blue',
    'Eventos': 'purple',
    'Comunicados': 'orange',
    'Capacitación': 'green',
    'Informes': 'teal'
  }
  return colors[category] || 'grey'
}

function getMediaIcon(type) {
  const icons = {
    'document': 'description',
    'video': 'videocam',
    'youtube': 'smart_display'
  }
  return icons[type] || 'attachment'
}

function getMediaColor(type) {
  const colors = {
    'document': 'blue',
    'video': 'purple',
    'youtube': 'red'
  }
  return colors[type] || 'grey'
}

function getImageUrl(path) {
  if (!path) return ''
  return getResourceUrl(path)
}

async function fetchPosts() {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage
    }
    
    if (filter.value.search) params.search = filter.value.search
    if (filter.value.status) params.status = filter.value.status
    if (filter.value.category) params.category = filter.value.category

    const response = await api.get('/blog/posts', { params })
    posts.value = response.data.items
    pagination.value.rowsNumber = response.data.pagination.totalItems
  } catch (error) {
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      $q.notify({ type: 'negative', message: 'Error al cargar publicaciones' })
    }
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const response = await api.get('/blog/categories')
    categories.value = response.data
  } catch (error) {
    // Handle authentication errors silently since the axios interceptor
    // already handles session expiration and redirects to login
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error('Error loading categories:', error)
    }
  }
}

function onRequest(props) {
  pagination.value = props.pagination
  fetchPosts()
}

function openDialog(item = null) {
  if (item) {
    editedItem.value = { ...item }
  } else {
    editedItem.value = {
      id: null,
      title: '',
      summary: '',
      content: '',
      category: 'Noticias',
      status: 'draft',
      featured_image_url: ''
    }
  }
  featuredImage.value = null
  imagePreview.value = null
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
  featuredImage.value = null
  imagePreview.value = null
}

function previewImage() {
  if (featuredImage.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(featuredImage.value)
  }
}

function removeImage() {
  featuredImage.value = null
  imagePreview.value = null
}

async function savePost() {
  saving.value = true
  try {
    const formData = new FormData()
    formData.append('title', editedItem.value.title)
    formData.append('summary', editedItem.value.summary || '')
    formData.append('content', editedItem.value.content || '')
    formData.append('category', editedItem.value.category)
    formData.append('status', editedItem.value.status)
    
    if (featuredImage.value) {
      formData.append('featured_image', featuredImage.value)
    }

    if (editedItem.value.id) {
      await api.put(`/blog/posts/${editedItem.value.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      $q.notify({ type: 'positive', message: 'Publicación actualizada' })
    } else {
      await api.post('/blog/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      $q.notify({ type: 'positive', message: 'Publicación creada' })
    }
    
    closeDialog()
    fetchPosts()
  } catch (error) {
    $q.notify({ 
      type: 'negative', 
      message: error.response?.data?.error || 'Error al guardar publicación' 
    })
  } finally {
    saving.value = false
  }
}

function confirmDelete(item) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar la publicación "${item.title}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/blog/posts/${item.id}`)
      $q.notify({ type: 'positive', message: 'Publicación eliminada' })
      fetchPosts()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar publicación' })
    }
  })
}

async function openMediaDialog(post) {
  currentPost.value = post
  mediaDialogOpen.value = true
  mediaTab.value = 'list'
  await fetchPostMedia()
  await fetchDocuments()
  await fetchVideos()
}

async function fetchPostMedia() {
  try {
    const response = await api.get(`/blog/posts/${currentPost.value.id}/media`)
    postMedia.value = response.data
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar medios' })
  }
}

async function fetchDocuments() {
  loadingDocuments.value = true
  try {
    const response = await api.get('/documents')
    documents.value = response.data
  } catch (error) {
    // Handle authentication errors silently since the axios interceptor
    // already handles session expiration and redirects to login
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error('Error loading documents:', error)
    }
  } finally {
    loadingDocuments.value = false
  }
}

async function fetchVideos() {
  loadingVideos.value = true
  try {
    const response = await api.get('/media/files', { params: { type: 'video' } })
    videos.value = response.data.items || response.data
  } catch (error) {
    // Handle authentication errors silently since the axios interceptor
    // already handles session expiration and redirects to login
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      console.error('Error loading videos:', error)
    }
  } finally {
    loadingVideos.value = false
  }
}

async function addMedia() {
  addingMedia.value = true
  try {
    await api.post(`/blog/posts/${currentPost.value.id}/media`, newMedia.value)
    $q.notify({ type: 'positive', message: 'Medio agregado' })
    resetMediaForm()
    mediaTab.value = 'list'
    await fetchPostMedia()
  } catch (error) {
    $q.notify({ 
      type: 'negative', 
      message: error.response?.data?.error || 'Error al agregar medio' 
    })
  } finally {
    addingMedia.value = false
  }
}

function resetMediaForm() {
  newMedia.value = {
    media_type: 'document',
    media_id: null,
    youtube_url: '',
    title: '',
    description: ''
  }
}

async function removeMedia(media) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar este medio?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/blog/posts/${currentPost.value.id}/media/${media.id}`)
      $q.notify({ type: 'positive', message: 'Medio eliminado' })
      await fetchPostMedia()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar medio' })
    }
  })
}

watch(() => newMedia.value.media_type, () => {
  newMedia.value.media_id = null
  newMedia.value.youtube_url = ''
})

onMounted(() => {
  fetchPosts()
  fetchCategories()
})
</script>

<style scoped>
.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
