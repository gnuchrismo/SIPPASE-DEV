<!--
  Proyecto: PORTAL SIPPASE - ROBITCMS
  Autor: Christian Mollo
  Contacto: gnuchrismo@gmail.com | LinkedIn: https://www.linkedin.com/in/gnuchrismo/?locale=es_ES
  Patrocinado por: UNWOMEN
-->
<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Profile Card -->
      <div class="col-12 col-md-4">
        <q-card class="profile-card text-center text-white">
            <div class="profile-header">
                <div class="avatar-container">
                    <q-avatar size="120px" class="q-mb-sm shadow-3">
                        <img v-if="user.avatar_url" :src="getAvatarUrl(user.avatar_url)" />
                        <q-icon v-else name="person" size="80px" color="grey-4" />
                        <q-btn
                            round
                            color="secondary"
                            icon="edit"
                            size="sm"
                            class="edit-avatar-btn"
                            @click="showMediaLibrary = true"
                        />
                    </q-avatar>
                </div>
                <div class="text-h5 q-mt-sm text-weight-bold">{{ user.full_name || user.username }}</div>
                <div class="text-subtitle2 opacity-80">{{ user.email }}</div>
                <div class="text-caption text-uppercase q-mt-xs chip-role">{{ user.role }}</div>
            </div>
            
            <q-card-section class="q-pt-lg bg-white text-grey-9 text-left">
                <div class="text-subtitle1 text-weight-bold q-mb-md">Información de Cuenta</div>
                <q-list separator>
                    <q-item>
                        <q-item-section avatar><q-icon name="person_outline" color="primary" /></q-item-section>
                        <q-item-section>
                            <q-item-label caption>Usuario</q-item-label>
                            <q-item-label>{{ user.username }}</q-item-label>
                        </q-item-section>
                    </q-item>
                     <q-item>
                        <q-item-section avatar><q-icon name="email" color="primary" /></q-item-section>
                        <q-item-section>
                            <q-item-label caption>Email</q-item-label>
                            <q-item-label>{{ user.email }}</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section avatar><q-icon name="calendar_today" color="primary" /></q-item-section>
                        <q-item-section>
                            <q-item-label caption>Miembro desde</q-item-label>
                            <q-item-label v-if="user.created_at">{{ formatDate(user.created_at) }}</q-item-label>
                            <q-item-label v-else>No disponible</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card-section>
        </q-card>
      </div>

      <!-- Edit Form -->
      <div class="col-12 col-md-8">
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
            <q-tab name="general" label="Datos Personales" icon="badge" />
            <q-tab name="security" label="Seguridad" icon="lock" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="general">
              <div class="text-h6 q-mb-md">Actualizar Información</div>
              <q-form @submit="saveProfile" class="q-gutter-md">
                <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                        <q-input 
                            filled 
                            v-model="form.full_name" 
                            label="Nombre Completo" 
                            hint="Tu nombre real para mostrar en el perfil"
                        />
                    </div>
                    <div class="col-12 col-md-6">
                        <q-input 
                            filled 
                            v-model="form.email" 
                            label="Correo Electrónico" 
                            type="email"
                            :rules="[val => !!val || 'Requerido', val => /.+@.+\..+/.test(val) || 'Email inválido']"
                        />
                    </div>
                    <div class="col-12">
                        <q-input 
                            filled 
                            v-model="form.avatar_url" 
                            label="URL del Avatar" 
                            readonly
                            hint="Selecciona una imagen desde la librería"
                        >
                            <template v-slot:append>
                                <q-btn round dense flat icon="image" @click="showMediaLibrary = true" />
                            </template>
                        </q-input>
                    </div>
                </div>
                
                <div class="row justify-end q-mt-lg">
                  <q-btn label="Guardar Cambios" type="submit" color="primary" icon="save" :loading="loading" />
                </div>
              </q-form>
            </q-tab-panel>

            <q-tab-panel name="security">
               <div class="text-h6 q-mb-md">Cambiar Contraseña</div>
               <q-banner class="bg-blue-1 text-blue-10 q-mb-md rounded-borders">
                   <template v-slot:avatar>
                       <q-icon name="info" color="blue" />
                   </template>
                   Deja estos campos vacíos si no deseas cambiar tu contraseña.
               </q-banner>

               <q-form @submit="saveProfile" class="q-gutter-md">
                   <q-input 
                        filled 
                        v-model="form.password" 
                        label="Nueva Contraseña" 
                        type="password"
                        hint="Mínimo 6 caracteres"
                   />
                   <q-input 
                        filled 
                        v-model="form.confirmPassword" 
                        label="Confirmar Contraseña" 
                        type="password"
                        :rules="[ val => val === form.password || 'Las contraseñas no coinciden' ]"
                   />
                   
                   <div class="row justify-end q-mt-lg">
                      <q-btn label="Actualizar Contraseña" type="submit" color="primary" icon="lock_reset" :loading="loading" />
                   </div>
               </q-form>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>

    <!-- Media Library Dialog for Avatar Selection -->
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
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useQuasar, date } from 'quasar'
import MediaLibrary from './MediaLibrary.vue' // Adjust path if needed

const $q = useQuasar()
const authStore = useAuthStore()
const tab = ref('general')
const loading = ref(false)
const showMediaLibrary = ref(false)

const user = computed(() => authStore.user || {})

const form = ref({
  full_name: '',
  email: '',
  avatar_url: '',
  password: '',
  confirmPassword: ''
})

onMounted(async () => {
    loading.value = true;
    try {
        await authStore.fetchProfile();
        resetForm();
    } catch (e) {
        $q.notify({ type: 'negative', message: 'Error cargando perfil' });
    } finally {
        loading.value = false;
    }
})

function resetForm() {
    form.value = {
        full_name: user.value.full_name || '',
        email: user.value.email || '',
        avatar_url: user.value.avatar_url || '',
        password: '',
        confirmPassword: ''
    }
}

function getAvatarUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Assuming relative paths are served from server root or uploads
    // Adjust based on your server configuration
    return `${import.meta.env.VITE_API_URL.replace('/api', '')}${path}`; 
}

function formatDate(timestamp) {
    return date.formatDate(timestamp, 'DD/MM/YYYY')
}

function selectAvatar(file) {
    // Assuming file object has url or path
    form.value.avatar_url = file.url || `/uploads/${file.filename}`; 
    showMediaLibrary.value = false;
}

async function saveProfile() {
    if (form.value.password && form.value.password !== form.value.confirmPassword) {
        $q.notify({ type: 'warning', message: 'Las contraseñas no coinciden' });
        return;
    }

    loading.value = true;
    try {
        const updateData = {
            full_name: form.value.full_name,
            email: form.value.email,
            avatar_url: form.value.avatar_url
        };

        if (form.value.password) {
            updateData.password = form.value.password;
        }

        await authStore.updateProfile(updateData);
        $q.notify({ type: 'positive', message: 'Perfil actualizado correctamente' });
        form.value.password = '';
        form.value.confirmPassword = '';
    } catch (error) {
        $q.notify({ type: 'negative', message: 'Error al actualizar perfil' });
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
.profile-card {
    border-radius: 12px;
    overflow: hidden;
}

.profile-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 30px 20px;
    position: relative;
}

.avatar-container {
    position: relative;
    display: inline-block;
}

.edit-avatar-btn {
    position: absolute;
    bottom: 0;
    right: 0;
    transform: translate(20%, 20%);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.opacity-80 {
    opacity: 0.8;
}

.chip-role {
    background: rgba(255,255,255,0.2);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    letter-spacing: 1px;
}
</style>
