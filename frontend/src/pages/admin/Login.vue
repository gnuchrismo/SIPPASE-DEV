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
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-2">
        <q-card class="q-pa-md shadow-2" bordered style="width: 400px">
          <q-card-section class="text-center">
            <div class="text-h5 text-weight-bold text-primary">SIPPASE Admin</div>
            <div class="text-grey-8">Iniciar Sesión</div>
          </q-card-section>
          
          <q-card-section>
            <q-banner v-if="errorMessage" class="bg-negative text-white q-mb-md" rounded>
              <template v-slot:avatar>
                <q-icon name="error" />
              </template>
              {{ errorMessage }}
            </q-banner>

            <q-form @submit="onSubmit" class="q-gutter-md">
              <q-input 
                filled 
                v-model="username" 
                label="Usuario" 
                :rules="[val => !!val || 'Usuario requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <q-input 
                filled 
                type="password" 
                v-model="password" 
                label="Contraseña"
                :rules="[val => !!val || 'Contraseña requerida']"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>

              <div>
                <q-btn 
                  label="Ingresar" 
                  type="submit" 
                  color="primary" 
                  class="full-width" 
                  :loading="loading"
                  size="md"
                />
              </div>

              <div class="text-center q-mt-md">
                <a href="/forgot-password" class="text-primary">¿Olvidaste tu contraseña?</a>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

// Reset state on load
authStore.error = null
authStore.loading = false

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function onSubmit() {
  loading.value = true
  errorMessage.value = ''
  
  try {
    await authStore.login(username.value, password.value)
    router.push('/admin/dashboard')
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = error.response?.data?.error || 'Error al iniciar sesión. Verifica tus credenciales.'
  } finally {
    loading.value = false
  }
}
</script>
