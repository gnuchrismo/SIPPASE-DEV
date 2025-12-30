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
    <div class="row q-mb-md items-center justify-between">
      <h1 class="text-h4 q-my-none">Mensajes de Contacto</h1>
      <div class="q-gutter-sm">
        <q-btn-toggle
          v-model="filterStatus"
          push
          glossy
          toggle-color="primary"
          :options="[
            {label: 'Todos', value: 'all'},
            {label: 'No Leídos', value: 'unread'},
            {label: 'Archivados', value: 'archived'}
          ]"
          @update:model-value="() => loadMessages()"
        />
      </div>
    </div>

    <q-table
      :rows="messages"
      :columns="columns"
      row-key="id"
      :loading="loading"
      v-model:pagination="pagination"
      @request="onRequest"
    >
      <template v-slot:body-cell-system="props">
        <q-td :props="props">
          <span v-if="props.row.system_name" class="text-primary text-weight-medium">
            {{ props.row.system_name }}
          </span>
          <span v-else class="text-grey-6 text-italic">
            General
          </span>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="props.row.is_read ? 'grey-4' : 'green-4'"
            :text-color="props.row.is_read ? 'black' : 'white'"
            size="sm"
          >
            {{ props.row.is_read ? 'Leído' : 'Nuevo' }}
          </q-chip>
          <q-chip
            v-if="props.row.is_archived"
            color="orange-4"
            text-color="white"
            size="sm"
            icon="archive"
          >
            Archivado
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-xs">
          <q-btn
            icon="visibility"
            color="primary"
            size="sm"
            flat
            dense
            @click="viewMessage(props.row)"
          >
            <q-tooltip>Ver Mensaje</q-tooltip>
          </q-btn>
          
          <q-btn
            :icon="props.row.is_read ? 'mark_email_unread' : 'mark_email_read'"
            color="secondary"
            size="sm"
            flat
            dense
            @click="toggleReadStatus(props.row)"
          >
            <q-tooltip>{{ props.row.is_read ? 'Marcar como no leído' : 'Marcar como leído' }}</q-tooltip>
          </q-btn>

          <q-btn
            :icon="props.row.is_archived ? 'unarchive' : 'archive'"
            color="warning"
            size="sm"
            flat
            dense
            @click="toggleArchiveStatus(props.row)"
          >
            <q-tooltip>{{ props.row.is_archived ? 'Desarchivar' : 'Archivar' }}</q-tooltip>
          </q-btn>

          <q-btn
            icon="delete"
            color="negative"
            size="sm"
            flat
            dense
            @click="confirmDelete(props.row)"
          >
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- View Message Dialog -->
    <q-dialog v-model="viewDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">Detalle del Mensaje</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="selectedMessage">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-subtitle2 text-grey">De:</div>
              <div>{{ selectedMessage.name }}</div>
              <div class="text-caption">{{ selectedMessage.email }}</div>
              <div v-if="selectedMessage.phone" class="text-caption">{{ selectedMessage.phone }}</div>
            </div>
            <div class="col-12 col-md-6 text-right">
              <div class="text-subtitle2 text-grey">Fecha:</div>
              <div>{{ formatDate(selectedMessage.created_at) }}</div>
            </div>
            <div v-if="selectedMessage.system_name" class="col-12">
              <div class="text-subtitle2 text-grey">Sistema:</div>
              <q-chip color="primary" text-color="white" icon="computer">
                {{ selectedMessage.system_name }}
              </q-chip>
            </div>
            <div class="col-12 q-mt-md">
              <div class="text-subtitle2 text-grey">Mensaje:</div>
              <div class="q-pa-sm bg-grey-2 rounded-borders" style="white-space: pre-wrap;">{{ selectedMessage.message }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none" v-if="selectedMessage">
           <q-input
            v-model="replyText"
            type="textarea"
            label="Respuesta Rápida (Simulada)"
            outlined
            dense
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
          <q-btn label="Responder" color="primary" @click="sendReply" :disable="!replyText" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { date, useQuasar } from 'quasar';
import { api } from 'boot/axios';

const $q = useQuasar();
const messages = ref([]); // Initialize as empty array to prevent undefined error
const loading = ref(false);
const filterStatus = ref('all');
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

const columns = [
  { name: 'created_at', label: 'Fecha', field: 'created_at', sortable: true, format: val => date.formatDate(val, 'DD/MM/YYYY HH:mm') },
  { name: 'name', label: 'Nombre', field: 'name', sortable: true, align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'system', label: 'Sistema', field: 'system_name', align: 'left' },
  { name: 'status', label: 'Estado', field: 'is_read', align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
];

const viewDialog = ref(false);
const selectedMessage = ref(null);
const replyText = ref('');

const loadMessages = async (props = null) => {
  loading.value = true;
  
  const { page, rowsPerPage } = (props && props.pagination) ? props.pagination : pagination.value;
  
  try {

    const response = await api.get('/contacts', {
      params: {
        page,
        limit: rowsPerPage,
        status: filterStatus.value
      }
    });

    messages.value = response.data.messages || []; // Ensure always an array
    pagination.value.page = response.data.currentPage;
    pagination.value.rowsPerPage = rowsPerPage;
    pagination.value.rowsNumber = response.data.total;
  } catch (error) {
    console.error('Error loading messages:', error);
    messages.value = []; // Set to empty array on error
    $q.notify({
      color: 'negative',
      message: 'Error al cargar mensajes',
      icon: 'report_problem'
    });
  } finally {
    loading.value = false;
  }
};

const onRequest = (props) => {
  loadMessages(props);
};

const viewMessage = async (message) => {
  selectedMessage.value = message;
  viewDialog.value = true;
  replyText.value = '';
  
  if (!message.is_read) {
    await toggleReadStatus(message, true);
  }
};

const toggleReadStatus = async (message, forceRead = null) => {
  const newStatus = forceRead !== null ? forceRead : !message.is_read;
  try {

    await api.patch(`/contacts/${message.id}/read`, {
      is_read: newStatus
    });
    
    message.is_read = newStatus;
    $q.notify({
      color: 'positive',
      message: newStatus ? 'Marcado como leído' : 'Marcado como no leído',
      icon: 'check'
    });
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Error al actualizar estado',
      icon: 'report_problem'
    });
  }
};

const toggleArchiveStatus = async (message) => {
  try {

    await api.patch(`/contacts/${message.id}/archive`, {
      is_archived: !message.is_archived
    });
    
    // Refresh list as it might disappear from current filter
    loadMessages();
    
    $q.notify({
      color: 'positive',
      message: !message.is_archived ? 'Mensaje archivado' : 'Mensaje desarchivado',
      icon: 'check'
    });
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Error al actualizar estado',
      icon: 'report_problem'
    });
  }
};

const confirmDelete = (message) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {

      await api.delete(`/contacts/${message.id}`);
      loadMessages();
      $q.notify({
        color: 'positive',
        message: 'Mensaje eliminado',
        icon: 'delete'
      });
    } catch (error) {
      $q.notify({
        color: 'negative',
        message: 'Error al eliminar mensaje',
        icon: 'report_problem'
      });
    }
  });
};

const sendReply = async () => {
  try {

    await api.post(`/contacts/${selectedMessage.value.id}/reply`, {
      replyContent: replyText.value
    });
    
    $q.notify({
      color: 'positive',
      message: 'Respuesta enviada (simulado)',
      icon: 'send'
    });
    viewDialog.value = false;
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Error al enviar respuesta',
      icon: 'report_problem'
    });
  }
};

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD/MM/YYYY HH:mm');
};

onMounted(() => {
  loadMessages();
});
</script>
