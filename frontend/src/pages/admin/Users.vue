<!--
  Proyecto: PORTAL SIPPASE - ROBITCMS
  Autor: Christian Mollo
  Contacto: gnuchrismo@gmail.com | LinkedIn: https://www.linkedin.com/in/gnuchrismo/?locale=es_ES
  Patrocinado por: UNWOMEN - Especialista en Desarrollo de Sistemas SIPPASE, Nov - Dic 2025
-->
<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h1 class="text-h4 q-my-none text-weight-bold text-primary">Gestión de Usuarios</h1>
        <div class="text-subtitle2 text-grey-7">Administra el acceso y roles del sistema</div>
      </div>
      <q-btn 
        color="primary" 
        icon="add" 
        label="Nuevo Usuario" 
        @click="openDialog()" 
        class="q-px-md q-py-sm shadow-2"
        no-caps
      />
    </div>

    <q-card class="shadow-2 rounded-borders">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
            <div class="col-12 col-md-4">
                <q-input 
                    dense 
                    outlined 
                    v-model="filter" 
                    placeholder="Buscar usuario..." 
                    class="bg-white"
                >
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
        </div>
      </q-card-section>

      <q-table
        :rows="users"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :filter="filter"
        flat
        bordered
      >
        <!-- Custom Avatar + Name Column -->
        <template v-slot:body-cell-username="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="32px" class="q-mr-sm">
                <img v-if="props.row.avatar_url" :src="getAvatarUrl(props.row.avatar_url)">
                <q-icon v-else name="account_circle" color="grey" size="32px" />
              </q-avatar>
              <div>
                <div class="text-weight-bold">{{ props.row.full_name || props.row.username }}</div>
                <div class="text-caption text-grey" v-if="props.row.full_name">@{{ props.row.username }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Role Chip -->
        <template v-slot:body-cell-role="props">
          <q-td :props="props">
             <q-chip 
                :color="getRoleColor(props.row.role)" 
                text-color="white" 
                dense 
                size="sm"
                class="text-weight-bold"
            >
                {{ formatRole(props.row.role) }}
             </q-chip>
          </q-td>
        </template>

        <!-- Status Chip -->
        <template v-slot:body-cell-is_active="props">
          <q-td :props="props">
            <q-chip 
                :color="props.row.is_active ? 'positive' : 'grey-5'" 
                text-color="white" 
                dense
                size="sm"
            >
              {{ props.row.is_active ? 'Activo' : 'Inactivo' }}
            </q-chip>
          </q-td>
        </template>

        <!-- Actions -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" align="right">
            <q-btn flat round color="grey-7" icon="edit" size="sm" @click="openDialog(props.row)">
                <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmDelete(props.row)">
                <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialogo Nuevo/Editar Usuario -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 600px; max-width: 90vw;">
        <q-toolbar class="bg-primary text-white">
            <q-toolbar-title>{{ editedItem.id ? 'Editar Usuario' : 'Nuevo Usuario' }}</q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-none">
            <q-tabs
                v-model="tab"
                dense
                class="text-grey"
                active-color="primary"
                indicator-color="primary"
                align="justify"
                narrow-indicator
            >
                <q-tab name="general" label="Datos Personales" icon="person" />
                <q-tab name="account" label="Cuenta y Seguridad" icon="security" />
                <q-tab name="permissions" label="Permisos" icon="admin_panel_settings" />
            </q-tabs>

            <q-separator />

            <q-form @submit="saveUser" class="q-pa-md">
                <q-tab-panels v-model="tab" animated>
                    
                    <!-- Tab: Datos Personales -->
                    <q-tab-panel name="general">
                        <div class="row q-col-gutter-md">
                             <div class="col-12 flex flex-center">
                                <q-avatar size="100px" class="shadow-3 cursor-pointer relative-position group" @click="showMediaLibrary = true">
                                    <img v-if="editedItem.avatar_url" :src="getAvatarUrl(editedItem.avatar_url)" />
                                    <q-icon v-else name="cloud_upload" color="grey-4" size="60px" />
                                    <div class="absolute-bottom text-center bg-black-50 text-white text-caption q-py-xs full-width" style="background: rgba(0,0,0,0.5)">
                                        Cambiar
                                    </div>
                                </q-avatar>
                            </div>
                            <div class="col-12">
                                <q-input 
                                    filled 
                                    v-model="editedItem.full_name" 
                                    label="Nombre Completo" 
                                    hint="Nombre visible para el usuario"
                                />
                            </div>
                            <div class="col-12">
                                <q-input 
                                    filled 
                                    v-model="editedItem.email" 
                                    label="Correo Electrónico" 
                                    type="email"
                                    :rules="[val => !!val || 'Requerido', val => /.+@.+\..+/.test(val) || 'Email inválido']"
                                />
                            </div>
                        </div>
                    </q-tab-panel>

                    <!-- Tab: Cuenta y Seguridad -->
                    <q-tab-panel name="account">
                        <div class="row q-col-gutter-md">
                             <div class="col-12">
                                <q-input 
                                    filled 
                                    v-model="editedItem.username" 
                                    label="Nombre de Usuario" 
                                    :rules="[val => !!val || 'Requerido']"
                                    hint="Identificador único para login"
                                />
                            </div>
                            <div class="col-12 col-md-6">
                                <q-input 
                                    filled 
                                    v-model="editedItem.password" 
                                    label="Contraseña" 
                                    type="password" 
                                    :rules="[val => (!editedItem.id && !val) ? 'Requerido para nuevos usuarios' : true]"
                                    hint="Dejar vacío para mantener la actual"
                                />
                            </div>
                            <div class="col-12 col-md-6">
                                <q-input 
                                    filled 
                                    v-model="editedItem.confirmPassword" 
                                    label="Confirmar Contraseña" 
                                    type="password" 
                                    :rules="[
                                        val => (!editedItem.id && !val) ? 'Requerido' : true,
                                        val => val === editedItem.password || 'Las contraseñas no coinciden'
                                    ]"
                                />
                            </div>
                            <div class="col-12">
                                <q-banner class="bg-grey-2 rounded-borders">
                                    <template v-slot:avatar>
                                        <q-icon name="info" color="primary" />
                                    </template>
                                    La contraseña debe tener al menos 6 caracteres.
                                </q-banner>
                            </div>
                        </div>
                    </q-tab-panel>

                    <!-- Tab: Permisos -->
                    <q-tab-panel name="permissions">
                         <div class="text-subtitle1 q-mb-md">Rol y Estado</div>
                         <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <q-select 
                                    filled 
                                    v-model="editedItem.role" 
                                    :options="roleOptions" 
                                    label="Rol del Usuario" 
                                    emit-value
                                    map-options
                                >
                                    <template v-slot:option="scope">
                                        <q-item v-bind="scope.itemProps">
                                            <q-item-section avatar>
                                                <q-icon :name="scope.opt.icon" />
                                            </q-item-section>
                                            <q-item-section>
                                                <q-item-label>{{ scope.opt.label }}</q-item-label>
                                                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                                            </q-item-section>
                                        </q-item>
                                    </template>
                                </q-select>
                            </div>
                            <div class="col-12 col-md-6 flex items-center">
                                <q-toggle 
                                    v-model="editedItem.is_active" 
                                    label="Cuenta Activa" 
                                    color="positive" 
                                    size="lg"
                                />
                            </div>
                         </div>
                    </q-tab-panel>
                </q-tab-panels>

                <div class="row justify-end q-mt-lg q-gutter-sm">
                    <q-btn label="Cancelar" color="grey" flat v-close-popup />
                    <q-btn :label="editedItem.id ? 'Guardar Cambios' : 'Crear Usuario'" type="submit" color="primary" icon="save" :loading="saving" />
                </div>
            </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Media Library Dialog -->
     <q-dialog v-model="showMediaLibrary">
      <q-card style="min-width: 80vw; min-height: 80vh;">
        <q-toolbar>
          <q-toolbar-title>Seleccionar Avatar</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="fit">
           <MediaLibrary @select="selectAvatar" :selection-mode="true" />
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../../boot/axios'
import { useQuasar } from 'quasar'
import MediaLibrary from './MediaLibrary.vue'

const $q = useQuasar()
const loading = ref(false)
const saving = ref(false)
const users = ref([])
const filter = ref('')
const dialogOpen = ref(false)
const tab = ref('general')
const showMediaLibrary = ref(false)

const roleOptions = [
    { label: 'Administrador', value: 'admin', description: 'Acceso total al sistema', icon: 'security' },
    { label: 'Editor', value: 'editor', description: 'Gestión de contenido básica', icon: 'edit' }
]

const editedItem = ref({
  id: null,
  username: '',
  full_name: '',
  email: '',
  avatar_url: '',
  role: 'editor',
  is_active: true,
  password: '',
  confirmPassword: ''
})

const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left', style: 'width: 50px' },
  { name: 'username', label: 'Usuario', field: 'username', sortable: true, align: 'left' },
  { name: 'email', label: 'Email', field: 'email', sortable: true, align: 'left' },
  { name: 'role', label: 'Rol', field: 'role', sortable: true, align: 'center' },
  { name: 'is_active', label: 'Estado', field: 'is_active', sortable: true, align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' }
]

// Fetch Users
async function fetchUsers() {
  loading.value = true
  try {
    const response = await api.get('/users')
    users.value = response.data.map(user => ({
      ...user,
      // Handle legacy roles structure if necessary, though backend should now be reliable
      role: user.roles && user.roles.length > 0 ? user.roles[0].name : (user.role || 'viewer')
    }))
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar usuarios' })
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Dialog & Form
function openDialog(item = null) {
  tab.value = 'general';
  if (item) {
    editedItem.value = { 
        ...item, 
        password: '', 
        confirmPassword: '' 
    }
  } else {
    editedItem.value = { 
        id: null, 
        username: '', 
        full_name: '',
        email: '', 
        avatar_url: '',
        role: 'editor', 
        is_active: true, 
        password: '',
        confirmPassword: ''
    }
  }
  dialogOpen.value = true
}

async function saveUser() {
  if (editedItem.value.password !== editedItem.value.confirmPassword) {
      $q.notify({ type: 'warning', message: 'Las contraseñas no coinciden' });
      return;
  }

  saving.value = true
  try {
    if (editedItem.value.id) {
      await api.put(`/users/${editedItem.value.id}`, editedItem.value)
      $q.notify({ type: 'positive', message: 'Usuario actualizado correctamente' })
    } else {
      await api.post('/users', editedItem.value)
      $q.notify({ type: 'positive', message: 'Nuevo usuario creado' })
    }
    dialogOpen.value = false
    fetchUsers()
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Error al guardar usuario. Verifique los datos.' })
  } finally {
    saving.value = false
  }
}

function confirmDelete(item) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de eliminar al usuario "${item.username}"? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true,
    ok: { label: 'Eliminar', color: 'negative' }
  }).onOk(async () => {
    try {
      await api.delete(`/users/${item.id}`)
      $q.notify({ type: 'positive', message: 'Usuario eliminado' })
      fetchUsers()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar usuario' })
    }
  })
}

// Helpers
function getAvatarUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL.replace('/api', '')}${path}`; 
}

function selectAvatar(file) {
    editedItem.value.avatar_url = file.url || `/uploads/${file.filename}`;
    showMediaLibrary.value = false;
}

function getRoleColor(role) {
    if (role === 'admin') return 'purple-7'
    if (role === 'editor') return 'cyan-7'
    return 'grey-7'
}

function formatRole(role) {
    if (role === 'admin') return 'ADMINISTRADOR'
    if (role === 'editor') return 'EDITOR'
    return role ? role.toUpperCase() : 'VISITANTE'
}

onMounted(fetchUsers)
</script>

<style scoped>
.q-card {
    border-radius: 12px;
}
.group:hover .absolute-bottom {
    opacity: 1;
}
</style>
