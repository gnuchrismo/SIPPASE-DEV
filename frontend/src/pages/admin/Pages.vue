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
      <h1 class="text-h4 q-my-none">📄 Páginas Adicionales</h1>
      <q-btn color="primary" icon="add" label="Nueva Página" @click="openDialog()" />
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-input 
            dense 
            outlined 
            v-model="filter.search" 
            placeholder="Buscar por título o slug..."
            debounce="300"
            @update:model-value="fetchPages"
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
            @update:model-value="fetchPages"
          />
        </div>
        <div class="col-12 col-md-3">
          <q-select
            dense
            outlined
            v-model="filter.footer"
            :options="footerOptions"
            label="Footer"
            clearable
            @update:model-value="fetchPages"
          />
        </div>
        <div class="col-12 col-md-2">
          <q-btn 
            outline 
            color="primary" 
            icon="refresh" 
            label="Actualizar" 
            @click="fetchPages" 
            class="full-width"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Pages Table -->
    <q-card flat bordered>
      <q-table
        :rows="pages"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        :pagination="pagination"
        @request="onRequest"
      >
        <template v-slot:body-cell-title="props">
          <q-td :props="props">
            <div class="text-weight-bold">{{ props.row.title }}</div>
            <div class="text-caption text-grey-7">{{ props.row.slug }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-is_published="props">
          <q-td :props="props">
            <q-chip 
              :color="props.row.is_published ? 'positive' : 'grey'" 
              text-color="white" 
              dense
              :icon="props.row.is_published ? 'check_circle' : 'edit'"
            >
              {{ props.row.is_published ? 'Publicado' : 'Borrador' }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-show_in_footer="props">
          <q-td :props="props">
            <q-icon 
              :name="props.row.show_in_footer ? 'check_circle' : 'cancel'" 
              :color="props.row.show_in_footer ? 'positive' : 'grey-5'"
              size="24px"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round color="primary" icon="edit" @click="openDialog(props.row)" size="sm" title="Editar">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round color="info" icon="visibility" @click="previewPage(props.row)" size="sm" title="Vista Previa">
              <q-tooltip>Vista Previa</q-tooltip>
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
          <div class="text-h6">{{ editedItem.id ? 'Editar Página' : 'Nueva Página' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md scroll" style="max-height: calc(100vh - 120px)">
          <q-form @submit="savePage" class="q-gutter-md">
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
                  @update:model-value="onTitleChange"
                />

                <q-input 
                  filled 
                  v-model="editedItem.slug" 
                  label="Slug (URL) *" 
                  :rules="[val => !!val || 'El slug es requerido', validateSlug]"
                  hint="URL-friendly identifier (ej: politica-de-privacidad)"
                  counter
                  maxlength="200"
                  class="q-mt-md"
                >
                  <template v-slot:append>
                    <q-btn 
                      flat 
                      dense 
                      icon="refresh" 
                      @click="generateSlugFromTitle"
                      :disable="!editedItem.title"
                    >
                      <q-tooltip>Generar desde título</q-tooltip>
                    </q-btn>
                  </template>
                </q-input>

                <div class="q-mt-md">
                  <div class="text-subtitle2 q-mb-sm">Contenido *</div>
                  <q-editor
                    v-model="editedItem.content"
                    min-height="500px"
                    :toolbar="editorToolbar"
                    :fonts="{
                      arial: 'Arial',
                      arial_black: 'Arial Black',
                      comic_sans: 'Comic Sans MS',
                      courier_new: 'Courier New',
                      impact: 'Impact',
                      lucida_grande: 'Lucida Grande',
                      times_new_roman: 'Times New Roman',
                      verdana: 'Verdana'
                    }"
                  />
                </div>
              </div>

              <!-- Right Column -->
              <div class="col-12 col-md-4">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle2 q-mb-md">Configuración</div>

                    <q-input
                      filled
                      v-model="editedItem.meta_description"
                      label="Meta Descripción (SEO)"
                      type="textarea"
                      rows="3"
                      counter
                      maxlength="300"
                      hint="Descripción para motores de búsqueda"
                    />

                    <q-input
                      filled
                      v-model="editedItem.meta_keywords"
                      label="Palabras Clave (SEO)"
                      hint="Separadas por comas"
                      class="q-mt-md"
                    />

                    <div class="q-mt-md">
                      <q-toggle 
                        v-model="editedItem.is_published" 
                        label="Publicado" 
                        color="positive"
                        left-label
                        class="full-width"
                      >
                        <q-tooltip>Hacer visible en el sitio público</q-tooltip>
                      </q-toggle>
                    </div>

                    <div class="q-mt-sm">
                      <q-toggle 
                        v-model="editedItem.show_in_footer" 
                        label="Mostrar en Footer" 
                        color="info"
                        left-label
                        class="full-width"
                      >
                        <q-tooltip>Mostrar enlace en el pie de página</q-tooltip>
                      </q-toggle>
                    </div>

                    <q-input
                      v-if="editedItem.show_in_footer"
                      filled
                      v-model.number="editedItem.display_order"
                      label="Orden en Footer"
                      type="number"
                      min="0"
                      class="q-mt-md"
                      hint="Orden de visualización (menor = primero)"
                    />

                    <div class="q-mt-md q-pa-sm bg-blue-1 rounded-borders">
                      <div class="text-caption text-grey-8">
                        <q-icon name="info" size="16px" class="q-mr-xs" />
                        URL de la página:
                      </div>
                      <div class="text-body2 text-primary q-mt-xs">
                        /page/{{ editedItem.slug || 'slug-de-la-pagina' }}
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
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../../boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const saving = ref(false)
const pages = ref([])
const dialogOpen = ref(false)
const filter = ref({
  search: '',
  status: null,
  footer: null
})

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const editedItem = ref({
  id: null,
  title: '',
  slug: '',
  content: '',
  meta_description: '',
  meta_keywords: '',
  is_published: false,
  show_in_footer: false,
  display_order: 0
})

const statusOptions = [
  { label: 'Borrador', value: 'draft' },
  { label: 'Publicado', value: 'published' }
]

const footerOptions = [
  { label: 'Sí', value: 'true' },
  { label: 'No', value: 'false' }
]

const editorToolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  ['quote', 'unordered', 'ordered'],
  [
    {
      label: $q.lang.editor.formatting,
      icon: $q.iconSet.editor.formatting,
      list: 'no-icons',
      options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    },
    {
      label: $q.lang.editor.fontSize,
      icon: $q.iconSet.editor.fontSize,
      fixedLabel: true,
      fixedIcon: true,
      list: 'no-icons',
      options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7']
    }
  ],
  ['link'],
  ['undo', 'redo'],
  ['viewsource']
]

const columns = [
  { name: 'title', label: 'Título', field: 'title', sortable: true, align: 'left' },
  { name: 'is_published', label: 'Estado', field: 'is_published', sortable: true, align: 'center' },
  { name: 'show_in_footer', label: 'Footer', field: 'show_in_footer', sortable: true, align: 'center' },
  { name: 'author_name', label: 'Autor', field: 'author_name', sortable: true, align: 'left' },
  { name: 'created_at', label: 'Creado', field: 'created_at', sortable: true, align: 'center',
    format: val => new Date(val).toLocaleDateString() },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
}

function validateSlug(val) {
  if (!val) return true
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugPattern.test(val) || 'El slug debe contener solo letras minúsculas, números y guiones'
}

function onTitleChange() {
  // Auto-generate slug only for new pages
  if (!editedItem.value.id && editedItem.value.title) {
    editedItem.value.slug = generateSlug(editedItem.value.title)
  }
}

function generateSlugFromTitle() {
  if (editedItem.value.title) {
    editedItem.value.slug = generateSlug(editedItem.value.title)
  }
}

async function fetchPages() {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage
    }
    
    if (filter.value.search) params.search = filter.value.search
    if (filter.value.status) params.status = filter.value.status
    if (filter.value.footer) params.footer = filter.value.footer

    const response = await api.get('/pages', { params })
    pages.value = response.data.items
    pagination.value.rowsNumber = response.data.pagination.totalItems
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar páginas' })
  } finally {
    loading.value = false
  }
}

function onRequest(props) {
  pagination.value = props.pagination
  fetchPages()
}

function openDialog(item = null) {
  if (item) {
    editedItem.value = { ...item }
  } else {
    editedItem.value = {
      id: null,
      title: '',
      slug: '',
      content: '',
      meta_description: '',
      meta_keywords: '',
      is_published: false,
      show_in_footer: false,
      display_order: 0
    }
  }
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
}

async function savePage() {
  saving.value = true
  try {
    const data = {
      title: editedItem.value.title,
      slug: editedItem.value.slug,
      content: editedItem.value.content || '',
      meta_description: editedItem.value.meta_description || '',
      meta_keywords: editedItem.value.meta_keywords || '',
      is_published: editedItem.value.is_published,
      show_in_footer: editedItem.value.show_in_footer,
      display_order: editedItem.value.display_order || 0
    }

    if (editedItem.value.id) {
      await api.put(`/pages/${editedItem.value.id}`, data)
      $q.notify({ type: 'positive', message: 'Página actualizada' })
    } else {
      await api.post('/pages', data)
      $q.notify({ type: 'positive', message: 'Página creada' })
    }
    
    closeDialog()
    fetchPages()
  } catch (error) {
    $q.notify({ 
      type: 'negative', 
      message: error.response?.data?.error || 'Error al guardar página' 
    })
  } finally {
    saving.value = false
  }
}

function confirmDelete(item) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar la página "${item.title}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/pages/${item.id}`)
      $q.notify({ type: 'positive', message: 'Página eliminada' })
      fetchPages()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar página' })
    }
  })
}

function previewPage(item) {
  if (item.is_published) {
    window.open(`/page/${item.slug}`, '_blank')
  } else {
    $q.notify({ 
      type: 'warning', 
      message: 'Esta página no está publicada. Publícala para verla en el sitio.' 
    })
  }
}

onMounted(() => {
  fetchPages()
})
</script>

<style scoped>
.q-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}
</style>
