<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h1 class="text-h4 q-my-none">Gestión de Tutoriales Multimedia</h1>
        <p class="text-grey-7 q-mv-none">Cree y administre cursos y tutoriales interactivos</p>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo Tutorial"
        to="/admin/tutorials/create"
        unelevated
      />
    </div>

    <q-card flat bordered class="shadow-1">
      <q-table
        :rows="tutorials"
        :columns="columns"
        row-key="id"
        :loading="store.loading"
        :filter="filter"
        flat
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip
              :color="getStatusColor(props.value)"
              text-color="white"
              size="sm"
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-is_public="props">
          <q-td :props="props">
             <q-badge :color="props.row.is_public ? 'green' : 'amber-8'" text-color="white">
                <q-icon :name="props.row.is_public ? 'public' : 'lock'" class="q-mr-xs" />
                {{ props.row.is_public ? 'Gratis (Público)' : 'Premium (Privado)' }}
             </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-cover="props">
          <q-td :props="props">
            <q-avatar rounded size="40px" v-if="props.row.cover_image">
              <img :src="props.row.cover_image">
            </q-avatar>
            <q-avatar rounded size="40px" color="grey-3" text-color="grey" v-else icon="image" />
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn icon="edit" flat round color="primary" :to="`/admin/tutorials/${props.row.id}/edit`">
                <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn icon="delete" flat round color="negative" @click="confirmDelete(props.row)">
                <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
             <q-btn icon="visibility" flat round color="secondary" :to="`/tutorials/${props.row.slug}`" target="_blank">
                <q-tooltip>Ver Previsualización</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTutorialStore } from '../../../stores/tutorialStore';
import { useQuasar } from 'quasar';

const filtered_tutorials = ref([]);
const store = useTutorialStore();
const $q = useQuasar();

// Use store state directly but mapped for q-table
const tutorials = ref([]);

const filter = ref('');

const columns = [
  { name: 'cover', label: 'Portada', align: 'left', field: 'cover_image' },
  { name: 'title', label: 'Título', align: 'left', field: 'title', sortable: true },
  { name: 'status', label: 'Estado', align: 'center', field: 'status', sortable: true },
  { name: 'is_public', label: 'Tipo Acceso', align: 'center', field: 'is_public', sortable: true },
  { name: 'author', label: 'Autor', align: 'left', field: row => row.author_name || 'Desconocido', sortable: true },
  { name: 'created_at', label: 'Fecha Creación', align: 'left', field: row => new Date(row.created_at).toLocaleDateString(), sortable: true },
  { name: 'actions', label: 'Acciones', align: 'right' }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'published': return 'positive';
    case 'draft': return 'warning';
    case 'archived': return 'grey';
    default: return 'primary';
  }
};

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de eliminar el tutorial "${row.title}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await store.deleteTutorial(row.id);
    loadData();
  });
};

const loadData = async () => {
  await store.fetchTutorials();
  tutorials.value = store.tutorials;
};

onMounted(() => {
  loadData();
});
</script>
