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
  <q-page class="not-found-container">
    <div class="not-found-content">
      <!-- Animated 404 -->
      <div class="not-found-animation">
        <div class="number-404">
          <span class="digit">4</span>
          <span class="digit zero">
            <q-icon name="search_off" />
          </span>
          <span class="digit">4</span>
        </div>
      </div>
      
      <!-- Message -->
      <h1 class="not-found-title">¡Oops! Página no encontrada</h1>
      <p class="not-found-description">
        La página que buscas no existe, fue movida o el enlace es incorrecto.
      </p>
      
      <!-- Search (optional) -->
      <div class="quick-search">
        <q-input
          v-model="searchQuery"
          outlined
          placeholder="Buscar en el sitio..."
          @keyup.enter="performSearch"
          class="search-input"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-btn
              flat
              dense
              icon="arrow_forward"
              color="primary"
              @click="performSearch"
              :disable="!searchQuery"
            />
          </template>
        </q-input>
      </div>
      
      <!-- Popular Links -->
      <div class="popular-links">
        <h3>Páginas populares:</h3>
        <div class="links-grid">
          <router-link to="/" class="popular-link">
            <q-icon name="home" />
            <span>Inicio</span>
          </router-link>
          <router-link to="/#sistemas" class="popular-link">
            <q-icon name="apps" />
            <span>Sistemas</span>
          </router-link>
          <router-link to="/#documentos" class="popular-link">
            <q-icon name="description" />
            <span>Documentos</span>
          </router-link>
          <router-link to="/estadisticas" class="popular-link">
            <q-icon name="bar_chart" />
            <span>Estadísticas</span>
          </router-link>
          <router-link to="/#contacto" class="popular-link">
            <q-icon name="mail" />
            <span>Contacto</span>
          </router-link>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="not-found-actions">
        <q-btn
          color="primary"
          label="Ir al Inicio"
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
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMeta } from 'quasar'

const router = useRouter()
const searchQuery = ref('')

useMeta({
  title: '404 - Página no encontrada',
  meta: {
    description: { name: 'description', content: 'La página que buscas no existe' },
    robots: { name: 'robots', content: 'noindex, nofollow' }
  }
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

function performSearch() {
  if (searchQuery.value.trim()) {
    // Redirect to home with search (can be enhanced with actual search functionality)
    router.push({ path: '/', query: { q: searchQuery.value } })
  }
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.not-found-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
  pointer-events: none;
}

.not-found-content {
  background: white;
  border-radius: 24px;
  padding: 60px 40px;
  max-width: 700px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.5s ease-out;
  position: relative;
  z-index: 1;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.not-found-animation {
  margin-bottom: 32px;
}

.number-404 {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 120px;
  font-weight: 900;
  line-height: 1;
}

.digit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: bounce 2s ease-in-out infinite;
}

.digit.zero {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border: 8px solid #667eea;
  border-radius: 50%;
  background: none;
  -webkit-text-fill-color: initial;
}

.digit.zero .q-icon {
  font-size: 60px;
  color: #667eea;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.digit:nth-child(1) {
  animation-delay: 0s;
}

.digit:nth-child(2) {
  animation-delay: 0.1s;
}

.digit:nth-child(3) {
  animation-delay: 0.2s;
}

.not-found-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 16px 0;
}

.not-found-description {
  font-size: 18px;
  color: #6c757d;
  line-height: 1.6;
  margin: 0 0 32px 0;
}

.quick-search {
  margin-bottom: 40px;
}

.search-input {
  max-width: 500px;
  margin: 0 auto;
}

.popular-links {
  margin-bottom: 40px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 16px;
}

.popular-links h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 20px 0;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.popular-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: white;
  border-radius: 12px;
  text-decoration: none;
  color: #667eea;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.popular-link:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.popular-link .q-icon {
  font-size: 28px;
}

.not-found-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Responsive Design */
@media (max-width: 768px) {
  .not-found-content {
    padding: 40px 24px;
  }
  
  .number-404 {
    font-size: 80px;
  }
  
  .digit.zero {
    width: 80px;
    height: 80px;
    border-width: 6px;
  }
  
  .digit.zero .q-icon {
    font-size: 40px;
  }
  
  .not-found-title {
    font-size: 24px;
  }
  
  .not-found-description {
    font-size: 16px;
  }
  
  .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .not-found-actions {
    flex-direction: column;
  }
  
  .not-found-actions .q-btn {
    width: 100%;
  }
}
</style>
