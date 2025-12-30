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
  <q-page class="error-page-container">
    <div class="error-content">
      <!-- Error Icon -->
      <div class="error-icon-wrapper">
        <q-icon :name="errorIcon" :color="errorColor" class="error-icon" />
      </div>
      
      <!-- Error Code -->
      <h1 class="error-code">{{ errorCode || '404' }}</h1>
      
      <!-- Error Message -->
      <h2 class="error-message">{{ errorMessage || 'Página no encontrada' }}</h2>
      
      <!-- Error Description -->
      <p class="error-description">
        {{ errorDescription || 'Lo sentimos, la página que buscas no existe o ha sido movida.' }}
      </p>
      
      <!-- Actions -->
      <div class="error-actions">
        <q-btn
          color="primary"
          label="Volver al Inicio"
          icon="home"
          size="lg"
          unelevated
          @click="goHome"
          class="q-mr-md"
        />
        <q-btn
          color="secondary"
          label="Volver Atrás"
          icon="arrow_back"
          size="lg"
          outline
          @click="goBack"
        />
      </div>
      
      <!-- Additional Help -->
      <div class="error-help">
        <p class="text-grey-7">¿Necesitas ayuda?</p>
        <div class="help-links">
          <router-link to="/#contacto" class="help-link">
            <q-icon name="mail" size="20px" />
            <span>Contactar Soporte</span>
          </router-link>
          <router-link to="/#documentos" class="help-link">
            <q-icon name="description" size="20px" />
            <span>Ver Documentación</span>
          </router-link>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  errorCode: {
    type: [String, Number],
    default: '404'
  },
  errorMessage: {
    type: String,
    default: 'Página no encontrada'
  },
  errorDescription: {
    type: String,
    default: 'Lo sentimos, la página que buscas no existe o ha sido movida.'
  }
})

const router = useRouter()

const errorIcon = computed(() => {
  const code = String(props.errorCode)
  
  if (code === '404') return 'search_off'
  if (code === '403') return 'lock'
  if (code === '401') return 'login'
  if (code.startsWith('5')) return 'error'
  return 'warning'
})

const errorColor = computed(() => {
  const code = String(props.errorCode)
  
  if (code === '404') return 'warning'
  if (code === '403' || code === '401') return 'orange'
  if (code.startsWith('5')) return 'negative'
  return 'grey-7'
})

function goHome() {
  router.push('/')
}

function goBack() {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.error-page-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.error-content {
  text-align: center;
  max-width: 600px;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-icon-wrapper {
  margin-bottom: 24px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.error-icon {
  font-size: 120px;
  opacity: 0.9;
}

.error-code {
  font-size: 120px;
  font-weight: 900;
  line-height: 1;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.03em;
}

.error-message {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 16px 0;
}

.error-description {
  font-size: 18px;
  color: #6c757d;
  line-height: 1.6;
  margin: 0 0 40px 0;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

.error-help {
  padding-top: 32px;
  border-top: 1px solid #dee2e6;
}

.error-help p {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.help-links {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.help-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  background: white;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.help-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }
  
  .error-icon {
    font-size: 80px;
  }
  
  .error-message {
    font-size: 24px;
  }
  
  .error-description {
    font-size: 16px;
  }
  
  .error-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .error-actions .q-btn {
    width: 100%;
  }
}
</style>
