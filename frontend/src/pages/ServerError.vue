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
  <q-page class="server-error-container">
    <div class="server-error-content">
      <!-- Animated Error Icon -->
      <div class="error-animation">
        <div class="error-icon-circle">
          <q-icon name="error" class="error-icon" />
        </div>
        <div class="error-waves">
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
        </div>
      </div>
      
      <!-- Error Code -->
      <h1 class="error-code">500</h1>
      
      <!-- Message -->
      <h2 class="error-title">Error del Servidor</h2>
      <p class="error-description">
        Lo sentimos, algo salió mal en nuestros servidores. Nuestro equipo técnico ha sido notificado y está trabajando para resolver el problema.
      </p>
      
      <!-- Suggestions -->
      <div class="error-suggestions">
        <h3>¿Qué puedes hacer?</h3>
        <ul>
          <li>
            <q-icon name="refresh" color="primary" />
            <span>Intenta recargar la página en unos momentos</span>
          </li>
          <li>
            <q-icon name="arrow_back" color="primary" />
            <span>Vuelve a la página anterior</span>
          </li>
          <li>
            <q-icon name="home" color="primary" />
            <span>Regresa a la página de inicio</span>
          </li>
          <li>
            <q-icon name="mail" color="primary" />
            <span>Contacta con soporte si el problema persiste</span>
          </li>
        </ul>
      </div>
      
      <!-- Error Details (optional) -->
      <div v-if="errorDetails" class="error-details">
        <q-expansion-item
          icon="info"
          label="Detalles técnicos"
          caption="Para desarrolladores"
          dense
        >
          <q-card>
            <q-card-section class="bg-grey-2">
              <pre class="error-stack">{{ errorDetails }}</pre>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
      
      <!-- Actions -->
      <div class="error-actions">
        <q-btn
          color="primary"
          label="Recargar Página"
          icon="refresh"
          size="lg"
          unelevated
          @click="reloadPage"
          class="q-mr-md"
        />
        <q-btn
          color="secondary"
          label="Ir al Inicio"
          icon="home"
          size="lg"
          outline
          @click="goHome"
        />
      </div>
      
      <!-- Report Error -->
      <div class="error-report">
        <p class="text-grey-7">¿El problema persiste?</p>
        <router-link to="/#contacto" class="report-link">
          <q-icon name="bug_report" size="20px" />
          <span>Reportar este error</span>
        </router-link>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeta } from 'quasar'

const router = useRouter()
const route = useRoute()

const errorDetails = ref(null)

// Get error details from route query if available
if (route.query.details && import.meta.env.DEV) {
  errorDetails.value = route.query.details
}

useMeta({
  title: '500 - Error del Servidor',
  meta: {
    description: { name: 'description', content: 'Error interno del servidor' },
    robots: { name: 'robots', content: 'noindex, nofollow' }
  }
})

function reloadPage() {
  window.location.reload()
}

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.server-error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  position: relative;
  overflow: hidden;
}

.server-error-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
  pointer-events: none;
}

.server-error-content {
  background: white;
  border-radius: 24px;
  padding: 60px 40px;
  max-width: 700px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: fadeInScale 0.5s ease-out;
  position: relative;
  z-index: 1;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.error-animation {
  position: relative;
  margin-bottom: 32px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon-circle {
  position: relative;
  z-index: 2;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.error-icon {
  font-size: 70px;
  color: white;
}

.error-waves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
}

.wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #f5576c;
  opacity: 0;
  animation: wave 3s ease-out infinite;
}

.wave:nth-child(2) {
  animation-delay: 1s;
}

.wave:nth-child(3) {
  animation-delay: 2s;
}

@keyframes wave {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.error-code {
  font-size: 80px;
  font-weight: 900;
  line-height: 1;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.03em;
}

.error-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 16px 0;
}

.error-description {
  font-size: 18px;
  color: #6c757d;
  line-height: 1.6;
  margin: 0 0 32px 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.error-suggestions {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
}

.error-suggestions h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 16px 0;
  text-align: center;
}

.error-suggestions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.error-suggestions li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
}

.error-suggestions li:last-child {
  border-bottom: none;
}

.error-suggestions li span {
  color: #2d3748;
  font-size: 15px;
}

.error-details {
  margin-bottom: 32px;
}

.error-stack {
  font-size: 12px;
  color: #333;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.error-report {
  padding-top: 24px;
  border-top: 1px solid #dee2e6;
}

.error-report p {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #6c757d;
}

.report-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  text-decoration: none;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
  transition: all 0.3s ease;
}

.report-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 87, 108, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .server-error-content {
    padding: 40px 24px;
  }
  
  .error-code {
    font-size: 60px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-description {
    font-size: 16px;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .error-actions .q-btn {
    width: 100%;
  }
}
</style>
