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
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="flex flex-center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <q-card style="width: 400px; max-width: 90vw;">
          <q-card-section class="text-center q-pt-lg">
            <q-icon name="lock_reset" size="64px" color="primary" />
            <div class="text-h5 q-mt-md">Recuperar Contraseña</div>
            <p class="text-grey-7">Ingresa tu email para recibir un enlace de recuperación</p>
          </q-card-section>

          <q-card-section v-if="!emailSent">
            <q-form @submit="requestReset">
              <q-input
                v-model="email"
                type="email"
                label="Email"
                outlined
                :rules="[val => !!val || 'Email requerido', val => /.+@.+\..+/.test(val) || 'Email inválido']"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <q-btn
                type="submit"
                color="primary"
                label="Enviar enlace"
                class="full-width q-mt-md"
                :loading="loading"
              />

              <div class="text-center q-mt-md">
                <router-link to="/admin/login" class="text-primary">
                  Volver al login
                </router-link>
              </div>
            </q-form>
          </q-card-section>

          <q-card-section v-else class="text-center">
            <q-icon name="check_circle" color="positive" size="48px" />
            <div class="text-h6 q-mt-md">¡Email enviado!</div>
            <p class="text-grey-7">
              Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
            </p>
            <p class="text-caption text-grey-6">
              Revisa tu bandeja de entrada y spam.
            </p>
            <q-btn
              color="primary"
              label="Volver al login"
              to="/admin/login"
              flat
              class="q-mt-md"
            />
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';

const $q = useQuasar();

const email = ref('');
const loading = ref(false);
const emailSent = ref(false);

const requestReset = async () => {
  loading.value = true;
  try {
    await axios.post('/api/password-reset/request', {
      email: email.value
    });
    emailSent.value = true;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al procesar solicitud',
      caption: error.response?.data?.error || error.message
    });
  } finally {
    loading.value = false;
  }
};
</script>
