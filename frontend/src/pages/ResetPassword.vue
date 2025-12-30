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
        <q-card style="width: 450px; max-width: 90vw;">
          <q-card-section class="text-center q-pt-lg">
            <q-icon name="vpn_key" size="64px" color="primary" />
            <div class="text-h5 q-mt-md">Nueva Contraseña</div>
            <p class="text-grey-7">Ingresa tu nueva contraseña</p>
          </q-card-section>

          <q-card-section v-if="!resetComplete">
            <div v-if="tokenValid === false" class="text-center">
              <q-icon name="error_outline" color="negative" size="48px" />
              <div class="text-h6 q-mt-md text-negative">Token inválido o expirado</div>
              <p class="text-grey-7">El enlace ha expirado o ya ha sido utilizado.</p>
              <q-btn
                color="primary"
                label="Solicitar nuevo enlace"
                to="/forgot-password"
                flat
              />
            </div>

            <q-form v-else-if="tokenValid" @submit="resetPassword">
              <div class="text-subtitle2 q-mb-sm">
                Usuario: <strong>{{ username }}</strong>
              </div>

              <q-input
                v-model="newPassword"
                :type="showPassword ? 'text' : 'password'"
                label="Nueva Contraseña*"
                outlined
                :rules="[
                  val => !!val || 'Contraseña requerida',
                  val => val.length >= 8 || 'Mínimo 8 caracteres'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>

              <!-- Password Strength Indicator -->
              <div v-if="newPassword" class="q-mt-sm">
                <div class="text-caption">Fortaleza:</div>
                <q-linear-progress
                  :value="passwordStrength / 100"
                  :color="passwordStrengthColor"
                  size="8px"
                  class="q-mt-xs"
                />
                <div class="text-caption" :class="`text-${passwordStrengthColor}`">
                  {{ passwordStrengthText }}
                </div>
              </div>

              <q-input
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                label="Confirmar Contraseña*"
                outlined
                class="q-mt-md"
                :rules="[
                  val => !!val || 'Confirmación requerida',
                  val => val === newPassword || 'Las contraseñas no coinciden'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>

              <q-btn
                type="submit"
                color="primary"
                label="Restablecer Contraseña"
                class="full-width q-mt-md"
                :loading="loading"
              />
            </q-form>

            <div v-else class="text-center">
              <q-spinner color="primary" size="48px" />
              <p class="text-grey-7 q-mt-md">Verificando token...</p>
            </div>
          </q-card-section>

          <q-card-section v-else class="text-center">
            <q-icon name="check_circle" color="positive" size="64px" />
            <div class="text-h6 q-mt-md">¡Contraseña actualizada!</div>
            <p class="text-grey-7">
              Tu contraseña ha sido restablecida exitosamente.
            </p>
            <q-btn
              color="primary"
              label="Ir al login"
              to="/admin/login"
              class="q-mt-md"
            />
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import axios from 'axios';

const route = useRoute();
const $q = useQuasar();

const token = ref(route.params.token);
const tokenValid = ref(null);
const username = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const loading = ref(false);
const resetComplete = ref(false);

// Password Strength
const passwordStrength = computed(() => {
  const password = newPassword.value;
  let strength = 0;
  
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
  if (/\d/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
  
  return Math.min(strength, 100);
});

const passwordStrengthColor = computed(() => {
  if (passwordStrength.value < 40) return 'negative';
  if (passwordStrength.value < 70) return 'warning';
  return 'positive';
});

const passwordStrengthText = computed(() => {
  if (passwordStrength.value < 40) return 'Débil';
  if (passwordStrength.value < 70) return 'Media';
  return 'Fuerte';
});

const verifyToken = async () => {
  try {
    const response = await axios.get(`/api/password-reset/verify/${token.value}`);
    tokenValid.value = response.data.valid;
    username.value = response.data.username;
  } catch (error) {
    tokenValid.value = false;
  }
};

const resetPassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    $q.notify({
      type: 'warning',
      message: 'Las contraseñas no coinciden'
    });
    return;
  }

  loading.value = true;
  try {
    await axios.post('/api/password-reset/reset', {
      token: token.value,
      new_password: newPassword.value
    });
    resetComplete.value = true;
    $q.notify({
      type: 'positive',
      message: 'Contraseña restablecida exitosamente'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al restablecer contraseña',
      caption: error.response?.data?.error || error.message
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  verifyToken();
});
</script>
