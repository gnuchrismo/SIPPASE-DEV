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
  <component :is="selectionMode ? 'div' : 'q-page'" :class="selectionMode ? 'q-pa-none h-100' : 'q-pa-md'">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md" v-if="!selectionMode">
      <div>
        <h1 class="text-h4 q-my-none">Biblioteca de Medios</h1>
        <div class="text-caption text-grey-7 q-mt-xs" v-if="stats">
          {{ stats.total_files }} archivos · {{ formatSize(stats.total_size) }} · {{ stats.total_folders }} carpetas
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn color="primary" icon="create_new_folder" label="Nueva Carpeta" outline @click="createFolderDialog = true" />
        <q-btn color="primary" icon="cloud_upload" label="Subir Archivo" @click="uploadDialog = true" />
      </div>
    </div>

    <!-- Selection Header -->
    <div class="row items-center justify-between q-mb-sm bg-grey-1 q-pa-sm rounded-borders" v-if="selectionMode">
         <div class="text-subtitle2">Seleccionar Archivo</div>
          <div class="row q-gutter-sm">
             <q-btn size="sm" color="primary" icon="create_new_folder" label="Carpeta" outline @click="createFolderDialog = true" />
             <q-btn size="sm" color="primary" icon="cloud_upload" label="Subir" @click="uploadDialog = true" />
          </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Sidebar / Filters -->
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Filtros</div>
            
            <!-- Search -->
            <q-input 
              dense 
              outlined 
              v-model="searchQuery" 
              placeholder="Buscar archivos..." 
              class="q-mb-md"
              debounce="500"
              @update:model-value="handleSearch"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <!-- Folders -->
            <div class="text-subtitle2 q-mb-sm">Carpetas</div>
            <q-list bordered separator class="rounded-borders q-mb-md">
              <q-item 
                clickable 
                v-ripple 
                :active="activeFolder === null" 
                @click="filterByFolder(null)"
                active-class="bg-primary text-white"
              >
                <q-item-section avatar>
                  <q-icon name="folder" />
                </q-item-section>
                <q-item-section>Todas</q-item-section>
                <q-item-section side v-if="stats">
                  <q-badge color="grey-5" text-color="black">{{ stats.total_files }}</q-badge>
                </q-item-section>
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
                <q-item-section avatar>
                  <q-icon name="folder_open" />
                </q-item-section>
                <q-item-section>{{ folder.folder }}</q-item-section>
                <q-item-section side>
                  <q-badge :color="activeFolder === folder.folder ? 'white' : 'grey-5'" :text-color="activeFolder === folder.folder ? 'primary' : 'black'">
                    {{ folder.file_count }}
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>

            <!-- File Type Filter -->
            <div class="text-subtitle2 q-mb-sm">Tipo de Archivo</div>
            <q-select
              dense
              outlined
              v-model="filterType"
              :options="fileTypeOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              @update:model-value="loadFiles(1)"
              class="q-mb-md"
            />

            <!-- Sort Options -->
            <div class="text-subtitle2 q-mb-sm">Ordenar por</div>
            <q-select
              dense
              outlined
              v-model="sortBy"
              :options="sortOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              @update:model-value="loadFiles(1)"
              class="q-mb-sm"
            />
            <q-btn-toggle
              v-model="sortOrder"
              spread
              no-caps
              toggle-color="primary"
              color="white"
              text-color="black"
              :options="[
                {label: 'Asc', value: 'ASC', icon: 'arrow_upward'},
                {label: 'Desc', value: 'DESC', icon: 'arrow_downward'}
              ]"
              @update:model-value="loadFiles(1)"
            />
          </q-card-section>
        </q-card>

        <!-- Bulk Actions (when files are selected) -->
        <q-card v-if="selectedFiles.length > 0" class="q-mt-md bg-blue-1">
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">{{ selectedFiles.length }} archivo(s) seleccionado(s)</div>
            <div class="column q-gutter-sm">
              <q-btn 
                size="sm" 
                outline 
                color="primary" 
                icon="drive_file_move" 
                label="Mover" 
                @click="showBulkMoveDialog" 
              />
              <q-btn 
                size="sm" 
                outline 
                color="negative" 
                icon="delete" 
                label="Eliminar" 
                @click="deleteBulkFiles" 
              />
              <q-btn 
                size="sm" 
                flat 
                color="grey-7" 
                label="Deseleccionar" 
                @click="selectedFiles = []" 
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- File Grid/List -->
      <div class="col-12 col-md-9">
        <!-- View Controls -->
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1">
            <span v-if="pagination.totalItems">
              Mostrando {{ ((pagination.page - 1) * pagination.limit) + 1 }} - 
              {{ Math.min(pagination.page * pagination.limit, pagination.totalItems) }} 
              de {{ pagination.totalItems }}
            </span>
          </div>
          <q-btn-toggle
            v-model="viewMode"
            no-caps
            toggle-color="primary"
            color="white"
            text-color="black"
            :options="[
              {label: 'Grid', value: 'grid', icon: 'grid_view'},
              {label: 'Lista', value: 'list', icon: 'view_list'}
            ]"
          />
        </div>

        <!-- Drop Zone -->
        <div
          class="drop-zone q-mb-md"
          :class="{ 'drop-zone-active': isDraggingOver }"
          @drop.prevent="handleFileDrop"
          @dragover.prevent="isDraggingOver = true"
          @dragenter.prevent="isDraggingOver = true"
          @dragleave.prevent="isDraggingOver = false"
        >
          <q-icon name="cloud_upload" size="3em" color="primary" />
          <div class="text-h6 q-mt-sm">Arrastra archivos aquí</div>
          <div class="text-caption text-grey">o haz clic en "Subir Archivo"</div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="row justify-center q-pa-xl">
          <q-spinner color="primary" size="3em" />
        </div>

        <!-- Empty State -->
        <div v-else-if="files.length === 0" class="text-center q-pa-xl text-grey">
          <q-icon name="cloud_off" size="4em" />
          <div class="text-h6 q-mt-md">No se encontraron archivos</div>
          <div class="text-caption">Sube tu primer archivo para comenzar</div>
        </div>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="row q-col-gutter-md">
          <div class="col-6 col-sm-4 col-md-3" v-for="file in files" :key="file.id">
            <q-card class="file-card cursor-pointer" @click="selectionMode ? emitSelection(file) : showFileDetails(file)">
              <q-checkbox 
                v-if="!selectionMode"
                v-model="selectedFiles" 
                :val="file.id" 
                class="file-checkbox"
                @click.stop
              />
              
              <q-img 
                v-if="file.mime_type.startsWith('image/')"
                :src="getFileUrl(file.path)" 
                :ratio="1"
                class="bg-grey-2"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-negative text-white">
                    Error
                  </div>
                </template>
              </q-img>
              <div v-else class="row items-center justify-center bg-grey-2" style="height: 150px; width: 100%">
                <q-icon :name="getFileIcon(file.mime_type)" size="4em" color="grey-7" />
              </div>

              <q-card-section class="q-pa-sm">
                <div class="text-subtitle2 text-truncate" :title="file.original_name">{{ file.original_name }}</div>
                <div class="text-caption text-grey">{{ formatSize(file.size) }}</div>
              </q-card-section>

              <!-- Selection Overlay (Hover effect handled by CSS or just relies on card click) -->
               <div v-if="selectionMode" class="absolute-full flex flex-center transition-opacity" :class="{ 'opacity-0 hover:opacity-100': !isSelected(file), 'opacity-100 bg-primary-transparent': isSelected(file) }" style="pointer-events: none">
                  <q-icon v-if="isSelected(file)" name="check_circle" color="primary" size="3em" />
                  <div v-else class="bg-primary text-white q-px-md q-py-sm rounded-borders shadow-2 cursor-pointer" style="pointer-events: auto">
                    Seleccionar
                  </div>
               </div>

              <q-menu touch-position context-menu v-if="!selectionMode">
                <q-list dense style="min-width: 150px">
                  <q-item clickable v-close-popup @click="showFileDetails(file)">
                    <q-item-section avatar><q-icon name="info" /></q-item-section>
                    <q-item-section>Detalles</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="renameFile(file)">
                    <q-item-section avatar><q-icon name="edit" /></q-item-section>
                    <q-item-section>Renombrar</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="copyUrl(getFileUrl(file.path))">
                    <q-item-section avatar><q-icon name="link" /></q-item-section>
                    <q-item-section>Copiar URL</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="deleteFile(file)">
                    <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                    <q-item-section>Eliminar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-card>
          </div>
        </div>

        <!-- List View -->
        <q-list v-else bordered separator class="rounded-borders">
          <q-item v-for="file in files" :key="file.id" clickable @click="selectionMode ? emitSelection(file) : showFileDetails(file)">
            <q-item-section avatar v-if="!selectionMode">
              <q-checkbox v-model="selectedFiles" :val="file.id" @click.stop />
            </q-item-section>
            <q-item-section avatar>
              <q-avatar v-if="file.mime_type.startsWith('image/')">
                <q-img :src="getFileUrl(file.path)" />
              </q-avatar>
              <q-icon v-else :name="getFileIcon(file.mime_type)" size="md" color="grey-7" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ file.original_name }}</q-item-label>
              <q-item-label caption>{{ file.folder }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ formatSize(file.size) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>{{ formatDate(file.created_at) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat round dense icon="more_vert" @click.stop>
                <q-menu>
                  <q-list dense style="min-width: 150px">
                    <q-item clickable v-close-popup @click="showFileDetails(file)">
                      <q-item-section avatar><q-icon name="info" /></q-item-section>
                      <q-item-section>Detalles</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="renameFile(file)">
                      <q-item-section avatar><q-icon name="edit" /></q-item-section>
                      <q-item-section>Renombrar</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="copyUrl(getFileUrl(file.path))">
                      <q-item-section avatar><q-icon name="link" /></q-item-section>
                      <q-item-section>Copiar URL</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item clickable v-close-popup @click="deleteFile(file)">
                      <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                      <q-item-section>Eliminar</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="row justify-center q-mt-md">
          <q-pagination
            v-model="currentPage"
            :max="pagination.totalPages"
            :max-pages="7"
            direction-links
            boundary-links
            @update:model-value="loadFiles"
            color="primary"
          />
        </div>
      </div>
    </div>

    <!-- Upload Dialog -->
    <q-dialog v-model="uploadDialog" @hide="resetUploadForm">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Subir Archivo</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="uploadFile" class="q-gutter-md">
            <q-file
              v-model="fileToUpload"
              label="Seleccionar archivo"
              filled
              counter
              max-file-size="1073741824"
              :rules="[val => !!val || 'Archivo requerido']"
              @update:model-value="previewFile"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
              <template v-slot:hint>
                Máximo 1GB. Formatos: imágenes, documentos, videos, audio
              </template>
            </q-file>

            <!-- File Preview -->
            <div v-if="filePreview" class="text-center q-pa-md bg-grey-2 rounded-borders">
              <q-img v-if="filePreview.type === 'image'" :src="filePreview.url" style="max-height: 200px" fit="contain" />
              <div v-else class="row items-center justify-center" style="height: 100px">
                <q-icon :name="getFileIcon(filePreview.mimeType)" size="3em" color="grey-7" />
              </div>
              <div class="text-caption q-mt-sm">{{ filePreview.name }} - {{ formatSize(filePreview.size) }}</div>
            </div>

            <q-select
              v-model="targetFolder"
              label="Carpeta"
              filled
              :options="folderOptions"
              use-input
              input-debounce="0"
              new-value-mode="add-unique"
              hint="Selecciona una carpeta existente o escribe un nombre nuevo"
            >
              <template v-slot:prepend>
                <q-icon name="folder" />
              </template>
            </q-select>

            <q-linear-progress v-if="uploading" :value="uploadProgress" color="primary" class="q-mt-md" />

            <div class="row justify-end q-mt-md q-gutter-sm">
              <q-btn label="Cancelar" flat v-close-popup color="primary" :disable="uploading" />
              <q-btn label="Subir" type="submit" color="primary" :loading="uploading" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- File Details Dialog -->
    <q-dialog v-model="detailsDialog">
      <q-card style="min-width: 600px" v-if="selectedFile">
        <q-card-section class="row items-center">
          <div class="text-h6">Detalles del Archivo</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="text-center bg-grey-2 q-pa-md">
           <q-img 
            v-if="selectedFile.mime_type.startsWith('image/')"
            :src="getFileUrl(selectedFile.path)" 
            style="max-height: 400px; max-width: 100%"
            fit="contain"
          />
          <video 
            v-else-if="selectedFile.mime_type.startsWith('video/')"
            :src="getFileUrl(selectedFile.path)"
            controls
            style="max-height: 400px; max-width: 100%"
          />
          <audio 
            v-else-if="selectedFile.mime_type.startsWith('audio/')"
            :src="getFileUrl(selectedFile.path)"
            controls
            class="full-width"
          />
          <q-icon v-else :name="getFileIcon(selectedFile.mime_type)" size="6em" color="grey-7" />
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <div class="text-caption text-grey">Nombre Original</div>
              <div class="text-subtitle1">{{ selectedFile.original_name }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey">Tipo</div>
              <div>{{ selectedFile.mime_type }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey">Tamaño</div>
              <div>{{ formatSize(selectedFile.size) }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey">Carpeta</div>
              <div>{{ selectedFile.folder }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey">Fecha</div>
              <div>{{ formatDate(selectedFile.created_at) }}</div>
            </div>
            <div class="col-12">
              <div class="text-caption text-grey">URL Pública</div>
              <div class="row items-center q-gutter-sm">
                <q-input 
                  dense 
                  readonly 
                  outlined 
                  :model-value="getFileUrl(selectedFile.path)" 
                  class="col-grow" 
                />
                <q-btn 
                  flat 
                  round 
                  dense 
                  icon="content_copy" 
                  @click="copyUrl(getFileUrl(selectedFile.path))"
                >
                  <q-tooltip>Copiar URL</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Renombrar" color="primary" icon="edit" @click="renameFile(selectedFile)" />
          <q-btn flat label="Eliminar" color="negative" icon="delete" @click="deleteFile(selectedFile)" />
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Rename Dialog -->
    <q-dialog v-model="renameDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Renombrar Archivo</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="newFileName"
            label="Nuevo nombre"
            filled
            autofocus
            @keyup.enter="confirmRename"
            :rules="[val => !!val && val.trim().length > 0 || 'El nombre no puede estar vacío']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup color="primary" />
          <q-btn flat label="Guardar" color="primary" @click="confirmRename" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Create Folder Dialog -->
    <q-dialog v-model="createFolderDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Crear Nueva Carpeta</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="newFolderName"
            label="Nombre de la carpeta"
            filled
            autofocus
            hint="Solo letras, números, guiones y guiones bajos"
            :rules="[
              val => !!val && val.trim().length > 0 || 'El nombre no puede estar vacío',
              val => /^[a-zA-Z0-9_-]+$/.test(val) || 'Solo se permiten letras, números, guiones y guiones bajos'
            ]"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup color="primary" />
          <q-btn flat label="Crear" color="primary" @click="confirmCreateFolder" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Bulk Move Dialog -->
    <q-dialog v-model="bulkMoveDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Mover {{ selectedFiles.length }} archivo(s)</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="bulkMoveFolder"
            label="Carpeta destino"
            filled
            :options="folderOptions"
            use-input
            input-debounce="0"
            new-value-mode="add-unique"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup color="primary" />
          <q-btn flat label="Mover" color="primary" @click="confirmBulkMove" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </component>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { date, useQuasar, copyToClipboard } from 'quasar';
import { api } from '../../boot/axios';
import { getResourceUrl } from '../../utils/urlHelper';

  const props = defineProps({
    selectionMode: {
      type: Boolean,
      default: false
    },
    initialFilterType: {
      type: String,
      default: ''
    }
  });

  const emit = defineEmits(['select']);

  const $q = useQuasar();
  const files = ref([]);
  const folders = ref([]);
  const stats = ref(null);
  const loading = ref(false);
  const uploading = ref(false);
  const uploadProgress = ref(0);
  const searchQuery = ref('');
  const activeFolder = ref(null);
  const filterType = ref(props.initialFilterType);
  const sortBy = ref('created_at');
  const sortOrder = ref('DESC');
  const viewMode = ref('grid');
  const selectedFiles = ref([]);
  const isDraggingOver = ref(false);

  const uploadDialog = ref(false);
  const detailsDialog = ref(false);
  const renameDialog = ref(false);
  const createFolderDialog = ref(false);
  const bulkMoveDialog = ref(false);

const fileToUpload = ref(null);
const filePreview = ref(null);
const targetFolder = ref('default');
const selectedFile = ref(null);
const newFileName = ref('');
const newFolderName = ref('');
const bulkMoveFolder = ref('');

const currentPage = ref(1);
const pagination = ref({
  page: 1,
  limit: 20,
  totalItems: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false
});

const fileTypeOptions = [
  { label: 'Todos', value: '' },
  { label: 'Imágenes', value: 'image' },
  { label: 'Videos', value: 'video' },
  { label: 'Audio', value: 'audio' },
  { label: 'Documentos', value: 'application' }
];

const sortOptions = [
  { label: 'Fecha de creación', value: 'created_at' },
  { label: 'Nombre', value: 'original_name' },
  { label: 'Tamaño', value: 'size' },
  { label: 'Tipo', value: 'mime_type' }
];

const folderOptions = computed(() => {
  return folders.value.map(f => f.folder);
});

const loadFiles = async (page = currentPage.value) => {
  loading.value = true;
  currentPage.value = page;
  
  try {
    const params = {
      page,
      limit: pagination.value.limit,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    };
    
    if (activeFolder.value) params.folder = activeFolder.value;
    if (filterType.value) params.type = filterType.value;
    if (searchQuery.value) params.search = searchQuery.value;
    
    const response = await api.get('/media', { params });
    
    files.value = response.data.items || [];
    pagination.value = response.data.pagination || pagination.value;
    
    // Clear selections when changing pages
    selectedFiles.value = [];
  } catch (error) {
    console.error('Error loading files:', error);
    $q.notify({ 
      type: 'negative', 
      message: 'Error al cargar archivos: ' + (error.response?.data?.error || error.message)
    });
  } finally {
    loading.value = false;
  }
};

const loadFolders = async () => {
  try {
    const response = await api.get('/media/folders');
    folders.value = response.data || [];
  } catch (error) {
    console.error('Error loading folders:', error);
  }
};

const loadStats = async () => {
  try {
    const response = await api.get('/media/stats');
    stats.value = response.data;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};

const handleSearch = () => {
  loadFiles(1);
};

const filterByFolder = (folder) => {
  activeFolder.value = folder;
  loadFiles(1);
};

const previewFile = () => {
  if (!fileToUpload.value) {
    filePreview.value = null;
    return;
  }

  const file = fileToUpload.value;
  filePreview.value = {
    name: file.name,
    size: file.size,
    mimeType: file.type,
    type: file.type.startsWith('image/') ? 'image' : 'other',
    url: null
  };

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      filePreview.value.url = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const uploadFile = async () => {
  if (!fileToUpload.value) return;
  
  uploading.value = true;
  uploadProgress.value = 0;
  
  const formData = new FormData();
  formData.append('file', fileToUpload.value);
  formData.append('folder', targetFolder.value || 'default');
  
  try {
    await api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = progressEvent.loaded / progressEvent.total;
      }
    });
    
    $q.notify({ type: 'positive', message: 'Archivo subido correctamente' });
    uploadDialog.value = false;
    resetUploadForm();
    loadFiles(currentPage.value);
    loadFolders();
    loadStats();
  } catch (error) {
    console.error('Error uploading file:', error);
    $q.notify({ 
      type: 'negative', 
      message: 'Error al subir archivo: ' + (error.response?.data?.error || error.message)
    });
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

const handleFileDrop = async (e) => {
  isDraggingOver.value = false;
  
  const droppedFiles = Array.from(e.dataTransfer.files);
  if (droppedFiles.length === 0) return;

  if (droppedFiles.length === 1) {
    fileToUpload.value = droppedFiles[0];
    previewFile();
    uploadDialog.value = true;
  } else {
    // Multiple files - upload them all
    $q.notify({ type: 'info', message: `Subiendo ${droppedFiles.length} archivos...` });
    
    for (const file of droppedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', activeFolder.value || 'default');
      
      try {
        await api.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        $q.notify({ 
          type: 'negative', 
          message: `Error al subir ${file.name}` 
        });
      }
    }
    
    $q.notify({ type: 'positive', message: 'Archivos subidos' });
    loadFiles(currentPage.value);
    loadFolders();
    loadStats();
  }
};

const resetUploadForm = () => {
    fileToUpload.value = null;
    filePreview.value = null;
    targetFolder.value = 'default';
    uploadProgress.value = 0;
};

const isSelected = (file) => {
    // In selection mode, we might just use visual feedback or a separate state
    // But let's check if it matches the emitted selection if we were to support persistence
    return false;
};

const emitSelection = (file) => {
    emit('select', {
        url: getFileUrl(file.path),
        ...file
    });
};

/* End script */

const deleteFile = (file) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de que deseas eliminar "${file.original_name}"? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/media/${file.id}`);
      
      $q.notify({ type: 'positive', message: 'Archivo eliminado' });
      detailsDialog.value = false;
      loadFiles(currentPage.value);
      loadFolders();
      loadStats();
    } catch (error) {
      console.error('Error deleting file:', error);
      $q.notify({ 
        type: 'negative', 
        message: 'Error al eliminar archivo: ' + (error.response?.data?.error || error.message)
      });
    }
  });
};

const deleteBulkFiles = () => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de que deseas eliminar ${selectedFiles.value.length} archivo(s)? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.post('/media/delete-multiple', { ids: selectedFiles.value });
      
      $q.notify({ type: 'positive', message: `${selectedFiles.value.length} archivos eliminados` });
      selectedFiles.value = [];
      loadFiles(currentPage.value);
      loadFolders();
      loadStats();
    } catch (error) {
      console.error('Error deleting files:', error);
      $q.notify({ 
        type: 'negative', 
        message: 'Error al eliminar archivos: ' + (error.response?.data?.error || error.message)
      });
    }
  });
};

const showFileDetails = (file) => {
  selectedFile.value = file;
  detailsDialog.value = true;
};

const renameFile = (file) => {
  selectedFile.value = file;
  newFileName.value = file.original_name;
  detailsDialog.value = false;
  renameDialog.value = true;
};

const confirmRename = async () => {
  if (!newFileName.value || newFileName.value.trim().length === 0) {
    $q.notify({ type: 'warning', message: 'El nombre no puede estar vacío' });
    return;
  }

  try {
    await api.put(`/media/${selectedFile.value.id}`, {
      original_name: newFileName.value.trim()
    });
    
    $q.notify({ type: 'positive', message: 'Archivo renombrado' });
    renameDialog.value = false;
    loadFiles(currentPage.value);
  } catch (error) {
    console.error('Error renaming file:', error);
    $q.notify({ 
      type: 'negative', 
      message: 'Error al renombrar: ' + (error.response?.data?.error || error.message)
    });
  }
};

const confirmCreateFolder = async () => {
  if (!newFolderName.value || newFolderName.value.trim().length === 0) {
    $q.notify({ type: 'warning', message: 'El nombre no puede estar vacío' });
    return;
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(newFolderName.value)) {
    $q.notify({ type: 'warning', message: 'Nombre inválido' });
    return;
  }

  try {
    await api.post('/media/folders', { name: newFolderName.value.trim() });
    
    $q.notify({ type: 'positive', message: 'Carpeta creada' });
    createFolderDialog.value = false;
    newFolderName.value = '';
    loadFolders();
  } catch (error) {
    console.error('Error creating folder:', error);
    $q.notify({ 
      type: 'negative', 
      message: 'Error al crear carpeta: ' + (error.response?.data?.error || error.message)
    });
  }
};

const showBulkMoveDialog = () => {
  bulkMoveFolder.value = '';
  bulkMoveDialog.value = true;
};

const confirmBulkMove = async () => {
  if (!bulkMoveFolder.value) {
    $q.notify({ type: 'warning', message: 'Selecciona una carpeta' });
    return;
  }

  try {
    for (const fileId of selectedFiles.value) {
      await api.post(`/media/${fileId}/move`, { folder: bulkMoveFolder.value });
    }
    
    $q.notify({ type: 'positive', message: `${selectedFiles.value.length} archivos movidos` });
    bulkMoveDialog.value = false;
    selectedFiles.value = [];
    loadFiles(currentPage.value);
    loadFolders();
  } catch (error) {
    console.error('Error moving files:', error);
    $q.notify({ 
      type: 'negative', 
      message: 'Error al mover archivos: ' + (error.response?.data?.error || error.message)
    });
  }
};

const getFileUrl = (path) => {
  if (!path) return '';
  return getResourceUrl(path);
};

const getFileIcon = (mimeType) => {
  if (mimeType.includes('pdf')) return 'picture_as_pdf';
  if (mimeType.includes('word') || mimeType.includes('doc')) return 'description';
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'table_chart';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'slideshow';
  if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('rar') || mimeType.includes('7z')) return 'folder_zip';
  if (mimeType.includes('audio')) return 'audio_file';
  if (mimeType.includes('video')) return 'video_file';
  return 'insert_drive_file';
};

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return date.formatDate(dateString, 'DD/MM/YYYY HH:mm');
};

const copyUrl = (url) => {
  copyToClipboard(url)
    .then(() => {
      $q.notify({ type: 'positive', message: 'URL copiada al portapapeles' });
    })
    .catch(() => {
      $q.notify({ type: 'negative', message: 'Error al copiar URL' });
    });
};

onMounted(() => {
  loadFiles();
  loadFolders();
  loadStats();
});
</script>

<style scoped>
.file-card {
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.file-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.file-card:hover .transition-opacity.opacity-0 {
    opacity: 1;
}

.transition-opacity {
    transition: opacity 0.2s ease;
}
.opacity-0 { opacity: 0; }
.opacity-100 { opacity: 1; }
.bg-primary-transparent { background: rgba(33, 150, 243, 0.2); }

.file-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 2px;
}

.drop-zone {
  border: 3px dashed #ccc;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s ease;
  background: #fafafa;
}

.drop-zone-active {
  border-color: var(--q-primary);
  background: rgba(33, 150, 243, 0.05);
  transform: scale(1.02);
}

.drop-zone:hover {
  border-color: var(--q-primary);
  background: rgba(33, 150, 243, 0.02);
}
</style>
