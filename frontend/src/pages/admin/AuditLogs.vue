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
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <h4 class="q-my-none">Audit Logs</h4>
        <p class="text-grey-7">Registro completo de actividades del sistema</p>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="file_download"
          label="Exportar"
          @click="exportLogs"
          :loading="exporting"
        />
      </div>
    </div>

    <!-- Filters -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- User Filter -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.user_id"
              :options="userOptions"
              option-value="user_id"
              option-label="username"
              label="Usuario"
              clearable
              outlined
              dense
              @update:model-value="loadLogs"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-select>
          </div>

          <!-- Action Filter -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.action"
              :options="actionOptions"
              label="Acción"
              clearable
              outlined
              dense
              @update:model-value="loadLogs"
            >
              <template v-slot:prepend>
                <q-icon name="play_arrow" />
              </template>
            </q-select>
          </div>

          <!-- Entity Filter -->
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.entity"
              :options="entityOptions"
              label="Entidad"
              clearable
              outlined
              dense
              @update:model-value="loadLogs"
            >
              <template v-slot:prepend>
                <q-icon name="category" />
              </template>
            </q-select>
          </div>

          <!-- Search -->
          <div class="col-12 col-md-3">
            <q-input
              v-model="filters.search"
              label="Buscar"
              outlined
              dense
              clearable
              @update:model-value="debouncedSearch"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Date Range -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="filters.start_date"
              label="Fecha Inicio"
              type="date"
              outlined
              dense
              @update:model-value="loadLogs"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="filters.end_date"
              label="Fecha Fin"
              type="date"
              outlined
              dense
              @update:model-value="loadLogs"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Statistics Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ stats.total || 0 }}</div>
            <div class="text-caption text-grey-7">Total Logs</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ stats.actions?.length || 0 }}</div>
            <div class="text-caption text-grey-7">Tipos de Acciones</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ stats.topUsers?.length || 0 }}</div>
            <div class="text-caption text-grey-7">Usuarios Activos</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ retentionDays }} días</div>
            <div class="text-caption text-grey-7">Retención</div>
            <q-btn
              flat
              dense
              icon="settings"
              size="sm"
              @click="showRetentionDialog = true"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Logs Table -->
    <q-card>
      <q-table
        :rows="logs"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        @request="onRequest"
        binary-state-sort
        flat
      >
        <!-- Action Column -->
        <template v-slot:body-cell-action="props">
          <q-td :props="props">
            <q-badge
              :color="getActionColor(props.row.action)"
              :label="props.row.action"
            />
          </q-td>
        </template>

        <!-- Details Column -->
        <template v-slot:body-cell-details="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              icon="visibility"
              size="sm"
              @click="viewDetails(props.row)"
            />
          </q-td>
        </template>

        <!-- Timestamp Column -->
        <template v-slot:body-cell-created_at="props">
          <q-td :props="props">
            {{ formatDate(props.row.created_at) }}
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Details Dialog -->
    <q-dialog v-model="detailsDialog">
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Detalles del Log</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedLog">
          <div class="q-gutter-sm">
            <div><strong>ID:</strong> {{ selectedLog.id }}</div>
            <div><strong>Usuario:</strong> {{ selectedLog.username || 'N/A' }}</div>
            <div><strong>Acción:</strong> <q-badge :color="getActionColor(selectedLog.action)" :label="selectedLog.action" /></div>
            <div><strong>Entidad:</strong> {{ selectedLog.entity || 'N/A' }}</div>
            <div><strong>ID Entidad:</strong> {{ selectedLog.entity_id || 'N/A' }}</div>
            <div><strong>IP:</strong> {{ selectedLog.ip_address }}</div>
            <div><strong>Fecha:</strong> {{ formatDate(selectedLog.created_at) }}</div>
            <div class="q-mt-md">
              <strong>Detalles:</strong>
              <pre class="q-mt-xs" style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;">{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Retention Policy Dialog -->
    <q-dialog v-model="showRetentionDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Política de Retención</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model.number="retentionDays"
            type="number"
            label="Días de retención"
            outlined
            min="1"
            max="365"
          />
          <q-toggle
            v-model="autoCleanup"
            label="Limpieza automática"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" @click="saveRetentionPolicy" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from '../../boot/axios';

const $q = useQuasar();

// State
const logs = ref([]);
const loading = ref(false);
const exporting = ref(false);
const stats = ref({});
const detailsDialog = ref(false);
const selectedLog = ref(null);
const showRetentionDialog = ref(false);
const retentionDays = ref(90);
const autoCleanup = ref(true);

// Filters
const filters = ref({
  user_id: null,
  action: null,
  entity: null,
  search: '',
  start_date: '',
  end_date: ''
});

const userOptions = ref([]);
const actionOptions = ref([]);
const entityOptions = ref([]);

// Pagination
const pagination = ref({
  page: 1,
  rowsPerPage: 50,
  rowsNumber: 0
});

// Table Columns
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'username', label: 'Usuario', field: 'username', sortable: true, align: 'left' },
  { name: 'action', label: 'Acción', field: 'action', sortable: true, align: 'center' },
  { name: 'entity', label: 'Entidad', field: 'entity', sortable: true, align: 'left' },
  { name: 'entity_id', label: 'ID Entidad', field: 'entity_id', align: 'left' },
  { name: 'ip_address', label: 'IP', field: 'ip_address', align: 'left' },
  { name: 'created_at', label: 'Fecha', field: 'created_at', sortable: true, align: 'left' },
  { name: 'details', label: 'Detalles', align: 'center' }
];

// Methods
const loadLogs = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      ...Object.fromEntries(
        Object.entries(filters.value).filter(([_, v]) => v != null && v !== '')
      )
    };

    const response = await api.get('/audit-logs', { params });
    logs.value = response.data.logs;
    pagination.value.rowsNumber = response.data.pagination.total;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar logs',
      caption: error.response?.data?.error || error.message
    });
  } finally {
    loading.value = false;
  }
};

const loadFilterOptions = async () => {
  try {
    const response = await api.get('/audit-logs/filter-options');
    userOptions.value = response.data.users;
    actionOptions.value = response.data.actions;
    entityOptions.value = response.data.entities;
  } catch (error) {
    console.error('Error loading filter options:', error);
  }
};

const loadStats = async () => {
  try {
    const response = await api.get('/audit-logs/stats', {
      params: { period: '30d' }
    });
    stats.value = response.data;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};

const loadRetentionPolicy = async () => {
  try {
    const response = await api.get('/audit-logs/retention');
    retentionDays.value = response.data.retention_days;
    autoCleanup.value = response.data.auto_cleanup_enabled;
  } catch (error) {
    console.error('Error loading retention policy:', error);
  }
};

const saveRetentionPolicy = async () => {
  try {
    await api.put('/audit-logs/retention', {
      retention_days: retentionDays.value,
      auto_cleanup_enabled: autoCleanup.value
    });
    $q.notify({
      type: 'positive',
      message: 'Política de retención actualizada'
    });
    showRetentionDialog.value = false;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar política',
      caption: error.response?.data?.error || error.message
    });
  }
};

const exportLogs = async () => {
  exporting.value = true;
  try {
    const params = {
      format: 'csv',
      ...Object.fromEntries(
        Object.entries(filters.value).filter(([_, v]) => v != null && v !== '')
      )
    };

    const response = await api.get('/audit-logs/export', {
      params,
      responseType: 'blob'
    });

    // Download file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit-logs-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    $q.notify({
      type: 'positive',
      message: 'Logs exportados exitosamente'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al exportar logs',
      caption: error.response?.data?.error || error.message
    });
  } finally {
    exporting.value = false;
  }
};

const viewDetails = (log) => {
  selectedLog.value = log;
  detailsDialog.value = true;
};

const onRequest = (props) => {
  pagination.value = props.pagination;
  loadLogs();
};

const getActionColor = (action) => {
  const colors = {
    create: 'positive',
    update: 'primary',
    delete: 'negative',
    login: 'info',
    logout: 'grey'
  };
  return colors[action] || 'grey';
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('es-BO');
};

let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadLogs();
  }, 500);
};

// Lifecycle
onMounted(() => {
  loadLogs();
  loadFilterOptions();
  loadStats();
  loadRetentionPolicy();
});
</script>
