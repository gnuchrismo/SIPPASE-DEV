<template>
  <q-dialog v-model="isOpen">
    <q-card class="auth-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold text-primary">Bienvenido a SIPPASE</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
        <q-tab name="login" label="Iniciar Sesión" />
        <q-tab name="register" label="Registrarse" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <!-- Login Panel -->
        <q-tab-panel name="login">
          <q-form @submit="handleLogin" class="q-gutter-md">
            <q-input outlined v-model="loginForm.email" label="Correo Electrónico" type="email" lazy-rules :rules="[val => !!val || 'Requerido']">
              <template v-slot:prepend><q-icon name="email" /></template>
            </q-input>

            <q-input outlined v-model="loginForm.password" label="Contraseña" type="password" lazy-rules :rules="[val => !!val || 'Requerido']">
              <template v-slot:prepend><q-icon name="lock" /></template>
            </q-input>

            <div class="row justify-between items-center">
              <q-checkbox v-model="loginForm.remember" label="Recordarme" />
              <div class="text-caption text-primary cursor-pointer hover-underline">¿Olvidaste tu contraseña?</div>
            </div>

            <q-btn unelevated color="primary" type="submit" label="Ingresar" class="full-width q-py-sm text-weight-bold" :loading="loading" />
          </q-form>
        </q-tab-panel>

        <!-- Register Panel -->
        <q-tab-panel name="register">
          <q-form @submit="handleRegister" class="q-gutter-md">
            <q-input outlined v-model="registerForm.username" label="Nombre de Usuario" lazy-rules :rules="[val => !!val || 'Requerido']">
              <template v-slot:prepend><q-icon name="person" /></template>
            </q-input>
            
            <q-input outlined v-model="registerForm.email" label="Correo Electrónico" type="email" lazy-rules :rules="[val => !!val || 'Requerido']">
              <template v-slot:prepend><q-icon name="email" /></template>
            </q-input>

            <q-input outlined v-model="registerForm.password" label="Contraseña" type="password" lazy-rules :rules="[val => !!val || 'Requerido', val => val.length >= 6 || 'Mínimo 6 caracteres']">
              <template v-slot:prepend><q-icon name="lock" /></template>
            </q-input>

            <q-btn unelevated color="secondary" type="submit" label="Crear Cuenta" class="full-width q-py-sm text-weight-bold" :loading="loading" />
          </q-form>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useQuasar } from 'quasar';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue', 'success']);

const authStore = useAuthStore();
const $q = useQuasar();

const tab = ref('login');
const loading = ref(false);

const loginForm = ref({ email: '', password: '', remember: false });
const registerForm = ref({ username: '', email: '', password: '' });

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const handleLogin = async () => {
    loading.value = true;
    try {
        await authStore.login(loginForm.value.email, loginForm.value.password);
        $q.notify({ type: 'positive', message: 'Bienvenido nuevamente' });
        isOpen.value = false;
        emit('success');
    } catch (e) {
        $q.notify({ type: 'negative', message: 'Credenciales inválidas' });
    } finally {
        loading.value = false;
    }
};

const handleRegister = async () => {
    loading.value = true;
    try {
        // Assume register action exists or call API directly. 
        // For MVP we might point to specific register endpoint. 
        // Since authStore might not have register, let's try to infer or implement.
        // If not, we block. I'll implementation basic register in authStore or here via API. 
        // Assuming authStore.register exists or I'll add it.
        if (authStore.register) {
            await authStore.register(registerForm.value);
        } else {
             // quick mock or improvement needed
             throw new Error("Registration not implemented in store yet");
        }
        $q.notify({ type: 'positive', message: 'Cuenta creada exitosamente' });
        isOpen.value = false;
        emit('success');
    } catch (e) {
        $q.notify({ type: 'negative', message: 'Error al registrarse: ' + e.message });
    } finally {
        loading.value = false;
    }
};

</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
}
.hover-underline:hover {
    text-decoration: underline;
}
</style>
