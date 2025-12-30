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
      <h1 class="text-h4 q-my-none">Gestión de Denuncias y Estadísticas</h1>
    </div>

    <q-card>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="import" icon="cloud_upload" label="Importar Excel" />
        <q-tab name="data" icon="table_view" label="Datos Importados" />
        <q-tab name="stats" icon="bar_chart" label="Vista Previa Estadísticas" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <!-- TAB 1: IMPORTAR EXCEL -->
        <q-tab-panel name="import">
          <div class="import-section text-center q-pa-lg">
            <q-banner class="bg-warning text-white q-mb-lg rounded-borders">
              <template v-slot:avatar>
                <q-icon name="warning" size="md" />
              </template>
              <div class="text-h6">⚠️ Advertencia Importante</div>
              <div>Importar un nuevo archivo <strong>ELIMINARÁ TODOS</strong> los datos anteriores. Asegúrese de tener un respaldo si es necesario.</div>
            </q-banner>
            
            <div class="row justify-center q-mb-lg">
              <q-file
                v-model="file"
                label="Seleccionar archivo Excel (.xlsx, .xls)"
                accept=".xlsx, .xls"
                outlined
                style="max-width: 400px; width: 100%"
                @update:model-value="handleFileSelect"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
            </div>
            
            <!-- Preview -->
            <div v-if="previewData.length > 0" class="preview-container q-mt-lg">
              <div class="text-h6 q-mb-md text-left">Vista Previa ({{ previewData.length }} registros detectados)</div>
              <q-table
                :rows="previewData.slice(0, 10)"
                :columns="previewColumns"
                dense
                flat
                bordered
                hide-bottom
                title="Primeros 10 registros"
              />
              
              <div class="q-mt-lg">
                <q-btn
                  color="primary"
                  icon="save"
                  label="Confirmar e Importar Datos"
                  size="lg"
                  @click="confirmImport"
                  :loading="importing"
                />
              </div>
            </div>
          </div>
        </q-tab-panel>

        <!-- TAB 2: DATOS IMPORTADOS -->
        <q-tab-panel name="data">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">Registro de Denuncias</div>
            <q-btn color="accent" icon="cloud_download" label="Exportar Excel" @click="exportData" :disable="complaints.length === 0" />
          </div>

          <q-table
            :rows="complaints"
            :columns="columns"
            row-key="id"
            :loading="loading"
            v-model:pagination="pagination"
            @request="onRequest"
            binary-state-sort
            class="sticky-header-table"
          >
            <template v-slot:top-right>
              <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- TAB 3: VISTA PREVIA ESTADÍSTICAS -->
        <q-tab-panel name="stats">
          <div class="text-h6 q-mb-md">Estadísticas Generadas (Vista Previa)</div>
          <div v-if="statistics.length > 0" class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card class="my-card">
                <q-card-section>
                  <div class="text-subtitle1">Resumen General</div>
                </q-card-section>
                <q-card-section>
                  <q-list dense>
                    <q-item v-for="stat in getStatsByCategory('General')" :key="stat.label">
                      <q-item-section>
                        <q-item-label>{{ stat.label }}</q-item-label>
                        <q-item-label caption>{{ stat.period }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-badge color="primary" :label="stat.value" />
                      </q-item-section>
                    </q-item>
                    <q-item v-for="stat in getStatsByCategory('Casos por Año')" :key="stat.label">
                      <q-item-section>
                        <q-item-label>Gestión {{ stat.label }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-badge color="secondary" :label="stat.value" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
            
            <div class="col-12 col-md-6">
              <q-card class="my-card">
                <q-card-section>
                  <div class="text-subtitle1">Tipología de Violencia (Top 5)</div>
                </q-card-section>
                <q-card-section>
                  <q-list dense>
                    <q-item v-for="stat in getStatsByCategory('Tipología Principal').slice(0, 5)" :key="stat.label">
                      <q-item-section>{{ stat.label }}</q-item-section>
                      <q-item-section side>
                        <q-badge color="secondary" :label="stat.value" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
          </div>
          <div v-else class="text-center text-grey q-pa-xl">
            No hay estadísticas generadas. Importe datos primero.
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../../boot/axios'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'

const $q = useQuasar()
const tab = ref('import')
const loading = ref(false)
const importing = ref(false)
const file = ref(null)
const complaints = ref([])
const statistics = ref([])
const filter = ref('')

// Pagination state
const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 15,
  rowsNumber: 0
})

// Import Preview State
const previewData = ref([])
const previewColumns = ref([])

// Columns for main table
const columns = [
  { name: 'correlativo', label: 'Correlativo', field: 'correlativo', align: 'left', sortable: true },
  { name: 'gestion', label: 'Gestión', field: 'gestion', align: 'center', sortable: true },
  { name: 'fecha_denuncia', label: 'Fecha Denuncia', field: row => formatDate(row.fecha_denuncia), align: 'left', sortable: true },
  { name: 'fecha_hecho', label: 'Fecha Hecho', field: row => formatDate(row.fecha_hecho), align: 'left' },
  { name: 'fecha_registro', label: 'Fecha Registro', field: row => formatDate(row.fecha_registro), align: 'left' },
  { name: 'departamento', label: 'Departamento', field: 'departamento', align: 'left', sortable: true },
  { name: 'municipio', label: 'Municipio', field: 'municipio', align: 'left', sortable: true },
  { name: 'slim', label: 'SLIM', field: 'slim', align: 'left' },
  { name: 'victima_nombre', label: 'Víctima', field: 'victima_nombre', align: 'left' },
  { name: 'victima_edad', label: 'Edad Vic.', field: 'victima_edad', align: 'center', sortable: true },
  { name: 'victima_genero', label: 'Género Vic.', field: 'victima_genero', align: 'left' },
  { name: 'victima_embarazo', label: 'Embarazo', field: 'victima_embarazo', align: 'left' },
  { name: 'victima_poblacion_vulnerable', label: 'Pob. Vulnerable', field: 'victima_poblacion_vulnerable', align: 'left' },
  { name: 'victima_autoidentificacion', label: 'Autoidentificación', field: 'victima_autoidentificacion', align: 'left' },
  { name: 'victima_hijos', label: 'Hijos', field: 'victima_hijos', align: 'center' },
  { name: 'victima_dependientes', label: 'Dependientes', field: 'victima_dependientes', align: 'center' },
  { name: 'tipologia_principal', label: 'Tipología Principal', field: 'tipologia_principal', align: 'left', sortable: true },
  { name: 'tipologia_secundaria', label: 'Tipología Secundaria', field: 'tipologia_secundaria', align: 'left' },
  { name: 'agresor_nombre', label: 'Agresor', field: 'agresor_nombre', align: 'left' },
  { name: 'genero_denunciados', label: 'Género Agresor', field: 'genero_denunciados', align: 'left' },
  { name: 'relacion_agresor', label: 'Relación', field: 'relacion_agresor', align: 'left' },
  { name: 'edad_denunciado', label: 'Edad Agresor', field: 'edad_denunciado', align: 'center' },
  { name: 'tipo_denunciado', label: 'Tipo Denunciado', field: 'tipo_denunciado', align: 'left' },
  { name: 'asistencia_familiar', label: 'Asistencia Fam.', field: 'asistencia_familiar', align: 'left' },
  { name: 'tipo_denunciante', label: 'Tipo Denunciante', field: 'tipo_denunciante', align: 'left' },
  { name: 'estado_caso', label: 'Estado', field: 'estado_caso', align: 'left' }
]

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-BO')
}

// Fetch complaints with pagination
async function onRequest(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  const filter = props.filter
  
  loading.value = true
  
  try {
    const response = await api.get('/complaints', {
      params: {
        page: page,
        limit: rowsPerPage,
        search: filter
      }
    })
    
    complaints.value = response.data.data
    pagination.value.rowsNumber = response.data.total
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar datos' })
  } finally {
    loading.value = false
  }
}

// Fetch statistics for preview
async function fetchStatistics() {
  try {
    const response = await api.get('/complaints/statistics')
    statistics.value = response.data
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

function getStatsByCategory(category) {
  return statistics.value.filter(s => s.category === category)
}

// Excel Import Logic
function handleFileSelect(file) {
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      
      if (jsonData.length === 0) {
        $q.notify({ type: 'warning', message: 'El archivo está vacío' })
        return
      }

      console.log('First row:', jsonData[0])

      // Helper to find value by possible keys (case-insensitive)
      const getValue = (row, keys) => {
        const rowKeys = Object.keys(row);
        for (const key of keys) {
          const foundKey = rowKeys.find(k => k.toLowerCase() === key.toLowerCase());
          if (foundKey) return row[foundKey];
        }
        return null;
      };

      // Helper for default values
      const getText = (val) => (val && val.toString().trim() !== '') ? val.toString().trim() : 'No registrado';
      const getNum = (val) => {
        const parsed = parseInt(val);
        return isNaN(parsed) ? 0 : parsed;
      };

      previewData.value = jsonData.map(row => {
        // 1. Parse Date first to help with Gestion
        const rawDate = getValue(row, ['Fecha Denuncia', 'fecha_denuncia', 'fecha_hecho', 'Fecha Hecho', 'Fecha']);
        const parsedDate = parseExcelDate(rawDate);
        
        // 2. Parse Gestion
        let gestion = getNum(getValue(row, ['Gestión', 'Gestion', 'Año', 'gestion', 'anio']));
        
        // If gestion is 0 or invalid, try to extract from date
        if ((!gestion || gestion === 0) && parsedDate) {
          gestion = new Date(parsedDate).getFullYear();
        }

        return {
          correlativo: getText(getValue(row, ['Correlativo', 'ID', 'id', 'codigo_ruv', 'Codigo RUV'])),
          gestion: gestion,
          fecha_denuncia: parsedDate,
          fecha_hecho: parseExcelDate(getValue(row, ['Fecha Hecho', 'fecha_hecho'])),
          fecha_registro: parseExcelDate(getValue(row, ['Fecha Registro', 'fecha_registro'])),
          departamento: getText(getValue(row, ['Departamento', 'departamento'])),
          municipio: getText(getValue(row, ['Municipio', 'municipio'])),
          slim: getText(getValue(row, ['SLIM', 'slim'])),
          victima_nombre: getText(getValue(row, ['Nombre Víctima', 'victima_nombre', 'Victima'])),
          victima_edad: getNum(getValue(row, ['Edad', 'Edad Víctima', 'victima_edad'])),
          victima_genero: getText(getValue(row, ['Género', 'victima_genero', 'Genero'])),
          victima_embarazo: getText(getValue(row, ['Embarazo', 'victima_embarazo'])),
          victima_poblacion_vulnerable: getText(getValue(row, ['Población Vulnerable', 'victima_poblacion_vulnerable', 'Poblacion Vulnerable'])),
          victima_autoidentificacion: getText(getValue(row, ['Autoidentificación', 'victima_autoidentificacion', 'Autoidentificacion'])),
          victima_hijos: getNum(getValue(row, ['Hijos', 'victima_hijos', 'Nro Hijos'])),
          victima_dependientes: getNum(getValue(row, ['Dependientes', 'victima_dependientes'])),
          tipologia_principal: getText(getValue(row, ['Tipología Principal', 'tipologia_principal', 'Tipologia Principal'])),
          tipologia_secundaria: getText(getValue(row, ['Tipología Secundaria', 'tipologia_secundaria', 'Tipologia Secundaria'])),
          agresor_nombre: getText(getValue(row, ['Nombre Agresor', 'agresor_nombre', 'Agresor'])),
          genero_denunciados: getText(getValue(row, ['Género Denunciado', 'genero_denunciados', 'Genero Denunciado'])),
          relacion_agresor: getText(getValue(row, ['Relación Agresor', 'relacion_agresor', 'Relacion Agresor'])),
          edad_denunciado: getNum(getValue(row, ['Edad Agresor', 'edad_denunciado', 'Edad Denunciado'])),
          tipo_denunciado: getText(getValue(row, ['Tipo Denunciado', 'tipo_denunciado'])),
          asistencia_familiar: getText(getValue(row, ['Asistencia Familiar', 'asistencia_familiar'])),
          tipo_denunciante: getText(getValue(row, ['Tipo Denunciante', 'tipo_denunciante'])),
          estado_caso: getText(getValue(row, ['Estado', 'estado_caso', 'Estado Caso']))
        };
      });
      
      // Generate preview columns
      if (previewData.value.length > 0) {
        previewColumns.value = Object.keys(previewData.value[0]).slice(0, 8).map(key => ({
          name: key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          field: key,
          align: 'left'
        }))
      }
    } catch (error) {
      console.error('Error parsing Excel:', error)
      $q.notify({ type: 'negative', message: 'Error al procesar el archivo Excel' })
    }
  }
  reader.readAsArrayBuffer(file)
}

function parseExcelDate(serial) {
  if (!serial) return null
  // If it's already a string like "2024-01-01"
  if (typeof serial === 'string' && serial.includes('-')) return serial
  // If it's an Excel serial number
  if (typeof serial === 'number') {
    const utc_days = Math.floor(serial - 25569)
    const date = new Date(utc_days * 86400 * 1000)
    return date.toISOString().split('T')[0]
  }
  return null
}

async function confirmImport() {
  importing.value = true
  try {
    const response = await api.post('/complaints/import', {
      complaints: previewData.value
    })
    
    $q.notify({
      type: 'positive',
      message: response.data.message
    })
    
    // Reset and switch tab
    file.value = null
    previewData.value = []
    tab.value = 'data'
    
    // Refresh data
    onRequest({ pagination: pagination.value })
    fetchStatistics()
    
  } catch (error) {
    console.error('Import error:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al importar: ' + (error.response?.data?.error || error.message)
    })
  } finally {
    importing.value = false
  }
}

function exportData() {
  // TODO: Implement full export if needed, or just export current view
  // For now, let's export what we have in the state or fetch all
  $q.notify({ type: 'info', message: 'Función de exportación en desarrollo' })
}

onMounted(() => {
  onRequest({ pagination: pagination.value })
  fetchStatistics()
})
</script>

<style scoped>
.sticky-header-table {
  /* height or max-height is important */
  height: calc(100vh - 250px);
}

.sticky-header-table .q-table__top,
.sticky-header-table .q-table__bottom,
.sticky-header-table thead tr:first-child th {
  /* bg color is important for th; just specify one */
  background-color: #fff;
}

.sticky-header-table thead tr th {
  position: sticky;
  z-index: 1;
}

.sticky-header-table thead tr:first-child th {
  top: 0;
}

/* this is when the loading indicator appears */
.sticky-header-table.q-table--loading thead tr:last-child th {
  /* height of all previous header rows */
  top: 48px;
}
</style>
