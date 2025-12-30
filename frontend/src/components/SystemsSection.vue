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
  <section 
    id="sistemas" 
    class="section systems-section"
    :style="sectionStyle"
  >
    <div class="wrap">
      <div class="section-header text-center q-mb-xl">
        <h2 
          class="text-h3 text-weight-bold q-mb-sm"
          :style="{ color: titleColor || '#2d3748' }"
        >
          {{ title || 'Nuestros Sistemas' }}
        </h2>
        <p class="subtitle text-grey-8 text-subtitle1">
          {{ subtitle || 'Componentes interconectados que trabajan en coordinación para la prevención y erradicación de la violencia' }}
        </p>
      </div>

      <div v-if="loading" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="3em" />
      </div>

      <div v-else-if="systems.length > 0" class="systems-grid">
        <div 
          v-for="(system, index) in systems" 
          :key="system.id" 
          class="system-card-wrapper"
        >
          <div 
            class="system-card"
            :class="`card-variant-${(index % 4) + 1}`"
          >
            <!-- Logo Background (always visible) -->
            <div class="card-background">
              <img 
                :src="getIconUrl(system.icon_url)" 
                :alt="system.name"
                class="background-logo"
              >
            </div>

            <!-- Hover Overlay (appears on hover) -->
            <div class="card-overlay">
              <div class="overlay-content">
                <!-- System Name -->
                <h3 class="system-name text-h4 text-weight-bold q-mb-md">
                  {{ system.name }}
                </h3>
                
                <!-- Description -->
                <div 
                  class="system-description text-body2 q-mb-lg"
                  v-html="system.description"
                ></div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                  <q-btn
                    v-if="system.url"
                    :href="system.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    round
                    size="md"
                    class="action-btn"
                    icon="launch"
                    color="white"
                    text-color="grey-9"
                  >
                    <q-tooltip 
                      anchor="top middle" 
                      self="bottom middle"
                      class="bg-grey-9 text-white"
                      :offset="[0, 8]"
                    >
                      Acceder al Sistema
                    </q-tooltip>
                  </q-btn>
                  
                  <q-btn
                    v-if="system.manual_url"
                    @click="openManual(system)"
                    round
                    size="md"
                    class="action-btn"
                    icon="menu_book"
                    color="white"
                    text-color="grey-9"
                  >
                    <q-tooltip 
                      anchor="top middle" 
                      self="bottom middle"
                      class="bg-grey-9 text-white"
                      :offset="[0, 8]"
                    >
                      Ver Manual de Usuario
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-grey-7 q-py-xl">
        <q-icon name="info" size="3em" class="q-mb-sm" />
        <p>No hay sistemas disponibles en este momento.</p>
      </div>
    </div>

    <!-- PDF Modal -->
    <q-dialog v-model="showManualModal" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-grey-1 text-white">
        <q-bar class="bg-primary text-white q-pa-md" style="height: auto">
          <q-icon name="menu_book" size="sm" />
          <div class="text-h6 q-ml-md">{{ selectedSystem?.name }} - Manual de Usuario</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Cerrar</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="q-pa-none full-height-dialog-content">
          <div v-if="selectedSystem?.manual_url" class="pdf-container">
            <iframe 
              :src="getManualUrl(selectedSystem.manual_url)" 
              width="100%" 
              height="100%" 
              frameborder="0"
            ></iframe>
          </div>
          <div v-else class="flex flex-center full-height text-grey-8">
            <p>El documento no se pudo cargar.</p>
          </div>
        </q-card-section>
        
        <!-- Floating Action Button for Download -->
        <q-page-sticky position="bottom-right" :offset="[18, 18]">
          <q-btn fab icon="download" color="secondary" :href="getManualUrl(selectedSystem?.manual_url)" target="_blank" rel="noopener noreferrer" label="Descargar">
             <q-tooltip>Descargar PDF</q-tooltip>
          </q-btn>
        </q-page-sticky>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../boot/axios'
import { getResourceUrl } from '../utils/urlHelper'
import { useQuasar } from 'quasar'

const props = defineProps({
  title: String,
  subtitle: String,
  bgSettings: Object,
  titleColor: String
})

const sectionStyle = computed(() => {
  if (!props.bgSettings) return { backgroundColor: '#ffffff' }
  
  const { type, color, gradientType, gradientDirection, gradientColor1, gradientColor2, image, imageSize, overlay, overlayOpacity } = props.bgSettings
  
  if (type === 'gradient') {
    const gradient = gradientType === 'linear' 
      ? `linear-gradient(${gradientDirection}, ${gradientColor1}, ${gradientColor2})`
      : `radial-gradient(circle, ${gradientColor1}, ${gradientColor2})`
    return { background: gradient }
  } else if (type === 'image' && image) {
    const opacity = overlayOpacity / 100
    const overlayRgba = hexToRgba(overlay, opacity)
    const bgImage = overlay && opacity > 0 
      ? `linear-gradient(${overlayRgba}, ${overlayRgba}), url(${image})`
      : `url(${image})`
    return {
      backgroundImage: bgImage,
      backgroundSize: imageSize === 'repeat' ? 'auto' : imageSize,
      backgroundRepeat: imageSize === 'repeat' ? 'repeat' : 'no-repeat',
      backgroundPosition: 'center'
    }
  }
  
  return { backgroundColor: color || '#ffffff' }
})

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const $q = useQuasar()
const systems = ref([])
const loading = ref(true)
const showManualModal = ref(false)
const selectedSystem = ref(null)

const fetchSystems = async () => {
  loading.value = true
  try {
    const response = await api.get('/systems')
    // Filter only active systems
    systems.value = response.data.filter(s => s.is_active)
  } catch (error) {
    console.error('Error fetching systems:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar los sistemas',
      icon: 'report_problem'
    })
  } finally {
    loading.value = false
  }
}

const getIconUrl = (path) => {
  if (!path) return '/assets/svg/shield.svg' // Fallback icon
  return getResourceUrl(path)
}

const getManualUrl = (path) => {
  if (!path) return '#'
  return getResourceUrl(path)
}

const openManual = (system) => {
  selectedSystem.value = system
  showManualModal.value = true
}

onMounted(() => {
  fetchSystems()
})
</script>

<style scoped>
.systems-section {
  background-color: #fff;
  padding: 80px 0;
  position: relative;
  overflow: hidden;
}

/* Decorative background elements for the section */
.systems-section::before {
  content: '';
  position: absolute;
  top: -10%;
  left: -5%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  z-index: 0;
}

.systems-section::after {
  content: '';
  position: absolute;
  bottom: -10%;
  right: -5%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(245, 87, 108, 0.05) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  z-index: 0;
}

.systems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-top: 40px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 1;
}

.system-card-wrapper {
  display: flex;
}

.system-card {
  width: 100%;
  height: 450px;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
  background: #fff;
}

.system-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Variantes de color para las tarjetas con gradientes más sofisticados */
.card-variant-1 {
  background: radial-gradient(circle at top left, #f6f9fc, #eef2f7);
}
.card-variant-1 .card-background::before {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.card-variant-2 {
  background: radial-gradient(circle at top left, #fff9f9, #fff0f0);
}
.card-variant-2 .card-background::before {
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%);
}

.card-variant-3 {
  background: radial-gradient(circle at top left, #f0f7ff, #e6f0ff);
}
.card-variant-3 .card-background::before {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%);
}

.card-variant-4 {
  background: radial-gradient(circle at top left, #f0fff4, #e6fffa);
}
.card-variant-4 .card-background::before {
  background: linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%);
}

/* Card Background - Logo visible by default */
.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  transition: opacity 0.4s ease;
}

/* Artistic shape behind logo */
.card-background::before {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.8;
  transition: all 0.6s ease;
  z-index: 0;
}

.system-card:hover .card-background::before {
  transform: scale(1.5);
  opacity: 0.4;
}

.system-card:hover .card-background {
  opacity: 1; /* Keep logo visible but blurred/dimmed via other means if needed, or overlay covers it */
}

.background-logo {
  max-width: 65%;
  max-height: 65%;
  object-fit: contain;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.12));
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1;
  position: relative;
}

.system-card:hover .background-logo {
  transform: scale(1.1) translateY(-10px);
  filter: blur(4px) grayscale(0.4);
  opacity: 0.3;
}

/* Hover Overlay - Hidden by default, appears on hover */
.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 32, 44, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column; /* Ensure flex column for vertical distribution */
  align-items: center;
  justify-content: space-between; /* Distribute space */
  padding: 32px 24px; /* Slightly reduced side padding, kept vertical */
  opacity: 0;
  visibility: hidden;
  transition: all 0.4s ease;
  z-index: 2;
}

.system-card:hover .card-overlay {
  opacity: 1;
  visibility: visible;
}

.overlay-content {
  text-align: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Start from top */
  height: 100%;
  padding-top: 10px; /* Slight top padding */
}

/* System Name in Overlay */
.system-name {
  color: #ffffff;
  font-size: 1.75rem;
  line-height: 1.2;
  margin-bottom: 12px; /* Reduced margin */
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-weight: 800;
  letter-spacing: -0.5px;
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0; /* Prevent shrinking */
}

.system-card:hover .system-name {
  transform: translateY(0);
  opacity: 1;
  transition-delay: 0.1s;
}

/* Description in Overlay */
.system-description {
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 16px; /* Reduced margin */
  max-width: 100%; /* Use full width */
  font-weight: 400;
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* Scrollable content */
  max-height: 260px; /* Significantly increased height */
  overflow-y: auto;
  padding-right: 6px;
  
  /* Custom Scrollbar Styling */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.4) rgba(255, 255, 255, 0.05);
}

.system-description::-webkit-scrollbar {
  width: 4px;
}

.system-description::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.system-description::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.4);
  border-radius: 4px;
}

.system-description::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.7);
}

.system-card:hover .system-description {
  transform: translateY(0);
  opacity: 1;
  transition-delay: 0.2s;
}

/* Action Buttons Container */
.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-top: auto; /* Push to bottom */
  padding-bottom: 10px; /* Bottom padding */
  flex-shrink: 0; /* Prevent shrinking */
}

.system-card:hover .action-buttons {
  transform: translateY(0);
  opacity: 1;
  transition-delay: 0.3s;
}

/* Action Buttons */
.action-btn {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.95) !important;
  border: none !important;
  color: #1a202c !important;
  width: 50px;
  height: 50px;
}

.action-btn :deep(.q-icon) {
  color: #1a202c !important;
  font-size: 1.5rem;
}

.action-btn:hover {
  transform: translateY(-5px) scale(1.1);
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.4);
  background: #ffffff !important;
}

.action-btn:active {
  transform: translateY(-2px) scale(1.05);
}

/* Modal Styles */
.full-height-dialog-content {
  height: calc(100vh - 70px);
  overflow: hidden;
}

.pdf-container {
  width: 100%;
  height: 100%;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .systems-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
  }
  
  .system-card {
    height: 420px;
  }
  
  .background-logo {
    max-width: 60%;
    max-height: 60%;
  }
  
  .system-name {
    font-size: 1.6rem;
  }
  
  .system-description {
    max-height: 230px;
  }
}

@media (max-width: 768px) {
  .systems-section {
    padding: 60px 0;
  }
  
  .systems-grid {
    grid-template-columns: 1fr;
    gap: 24px;
    max-width: 450px;
  }
  
  .system-card {
    height: 400px;
  }
  
  .card-overlay {
    padding: 24px 20px;
  }
  
  .background-logo {
    max-width: 55%;
    max-height: 55%;
  }
  
  .system-name {
    font-size: 1.5rem;
  }
  
  .system-description {
    font-size: 0.9rem;
    margin-bottom: 20px;
    max-height: 210px;
  }
  
  .action-btn {
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 480px) {
  .system-card {
    height: 380px;
  }
  
  .background-logo {
    max-width: 50%;
    max-height: 50%;
  }
  
  .system-name {
    font-size: 1.35rem;
  }
  
  .system-description {
    font-size: 0.85rem;
    line-height: 1.5;
    max-height: 190px;
  }
  
  .action-btn {
    width: 44px;
    height: 44px;
  }
}
</style>
