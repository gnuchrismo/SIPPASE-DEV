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
        <h4 class="q-my-none">Gestión de Roles</h4>
        <p class="text-grey-7">Administración de roles y permisos del sistema</p>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo Rol"
          @click="openRoleDialog()"
        />
      </div>
    </div>

    <!-- Roles Grid -->
    <div class="row q-col-gutter-md">
      <div v-for="role in roles" :key="role.id" class="col-12 col-md-6 col-lg-4">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">{{ role.name }}</div>
                <div v-if="role.is_system_role" class="text-caption">
                  <q-icon name="lock" size="xs" /> Rol del Sistema
                </div>
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  dense
                  round
                  icon="more_vert"
                  color="white"
                >
                  <q-menu>
                    <q-list>
                      <q-item clickable v-close-popup @click="openRoleDialog(role)">
                        <q-item-section avatar>
                          <q-icon name="edit" />
                        </q-item-section>
                        <q-item-section>Editar</q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        @click="managePermissions(role)"
                      >
                        <q-item-section avatar>
                          <q-icon name="security" />
                        </q-item-section>
                        <q-item-section>Permisos</q-item-section>
                      </q-item>
                      <q-separator v-if="!role.is_system_role" />
                      <q-item
                        v-if="!role.is_system_role"
                        clickable
                        v-close-popup
                        @click="deleteRole(role)"
                      >
                        <q-item-section avatar>
                          <q-icon name="delete" color="negative" />
                        </q-item-section>
                        <q-item-section>Eliminar</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <p class="text-grey-7">{{ role.description || 'Sin descripción' }}</p>
            
            <div class="row q-col-gutter-sm q-mt-md">
              <div class="col-6">
                <div class="text-center">
                  <div class="text-h6">{{ role.user_count || 0 }}</div>
                  <div class="text-caption text-grey-7">Usuarios</div>
                </div>
              </div>
              <div class="col-6">
                <div class="text-center">
                  <div class="text-h6">{{ role.permission_count || 0 }}</div>
                  <div class="text-caption text-grey-7">Permisos</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Role Dialog -->
    <q-dialog v-model="roleDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editingRole ? 'Editar Rol' : 'Nuevo Rol' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="roleForm.name"
            label="Nombre del Rol*"
            outlined
            :readonly="editingRole?.is_system_role"
            :rules="[val => !!val || 'El nombre es requerido']"
          />
          <q-input
            v-model="roleForm.description"
            label="Descripción"
            type="textarea"
            outlined
            rows="3"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            label="Guardar"
            @click="saveRole"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Permissions Dialog -->
    <q-dialog v-model="permissionsDialog" persistent>
      <q-card style="min-width: 700px; max-width: 900px;">
        <q-card-section>
          <div class="text-h6">Permisos - {{ selectedRole?.name }}</div>
        </q-card-section>

        <q-card-section style="max-height: 500px;" class="scroll">
          <div v-for="(perms, module) in groupedPermissions" :key="module" class="q-mb-md">
            <div class="text-subtitle1 text-weight-bold q-mb-sm">
              {{ module.toUpperCase() }}
            </div>
            <div class="row q-col-gutter-sm">
              <div v-for="perm in perms" :key="perm.id" class="col-6 col-md-3">
                <q-checkbox
                  v-model="selectedPermissions"
                  :val="perm.id"
                  :label="perm.action"
                  :color="getPermissionColor(perm.action)"
                />
              </div>
            </div>
            <q-separator class="q-mt-md" />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            label="Guardar Permisos"
            @click="savePermissions"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from '../../boot/axios';

const $q = useQuasar();

// State
const roles = ref([]);
const permissions = ref([]);
const roleDialog = ref(false);
const permissionsDialog = ref(false);
const editingRole = ref(null);
const selectedRole = ref(null);
const selectedPermissions = ref([]);
const saving = ref(false);

const roleForm = ref({
  name: '',
  description: ''
});

// Computed
const groupedPermissions = computed(() => {
  return permissions.value.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {});
});

// Methods
const loadRoles = async () => {
  try {
    const response = await api.get('/roles');
    roles.value = response.data;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar roles',
      caption: error.response?.data?.error || error.message
    });
  }
};

const loadPermissions = async () => {
  try {
    const response = await api.get('/permissions');
    permissions.value = response.data.all;
  } catch (error) {
    console.error('Error loading permissions:', error);
  }
};

const openRoleDialog = (role = null) => {
  editingRole.value = role;
  if (role) {
    roleForm.value = {
      name: role.name,
      description: role.description
    };
  } else {
    roleForm.value = {
      name: '',
      description: ''
    };
  }
  roleDialog.value = true;
};

const saveRole = async () => {
  if (!roleForm.value.name) {
    $q.notify({
      type: 'warning',
      message: 'El nombre del rol es requerido'
    });
    return;
  }

  saving.value = true;
  try {
    if (editingRole.value) {
      await api.put(`/roles/${editingRole.value.id}`, roleForm.value);
      $q.notify({
        type: 'positive',
        message: 'Rol actualizado exitosamente'
      });
    } else {
      await api.post('/roles', roleForm.value);
      $q.notify({
        type: 'positive',
        message: 'Rol creado exitosamente'
      });
    }
    roleDialog.value = false;
    loadRoles();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar rol',
      caption: error.response?.data?.error || error.message
    });
  } finally {
    saving.value = false;
  }
};

const deleteRole = async (role) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar el rol "${role.name}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/roles/${role.id}`);
      $q.notify({
        type: 'positive',
        message: 'Rol eliminado exitosamente'
      });
      loadRoles();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar rol',
        caption: error.response?.data?.error || error.message
      });
    }
  });
};

const managePermissions = async (role) => {
  selectedRole.value = role;
  
  try {
    const response = await api.get(`/roles/${role.id}/permissions`);
    selectedPermissions.value = response.data.map(p => p.id);
    permissionsDialog.value = true;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar permisos del rol',
      caption: error.response?.data?.error || error.message
    });
  }
};

const savePermissions = async () => {
  saving.value = true;
  try {
    await api.put(`/roles/${selectedRole.value.id}/permissions`, {
      permission_ids: selectedPermissions.value
    });
    $q.notify({
      type: 'positive',
      message: 'Permisos actualizados exitosamente'
    });
    permissionsDialog.value = false;
    loadRoles();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar permisos',
      caption: error.response?.data?.error || error.message
    });
  } finally {
    saving.value = false;
  }
};

const getPermissionColor = (action) => {
  const colors = {
    create: 'positive',
    read: 'info',
    update: 'warning',
    delete: 'negative'
  };
  return colors[action] || 'primary';
};

// Lifecycle
onMounted(() => {
  loadRoles();
  loadPermissions();
});
</script>
