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
    id="documentos" 
    class="documents-section"
    :style="sectionStyle"
  >
    <div class="wrap">
      <div class="section-header">
        <h2 
          class="section-title"
          :style="{ color: titleColor || '#2d3748' }"
        >
          {{ title || '📚 Documentos y Recursos' }}
        </h2>
        <p class="section-subtitle">{{ subtitle || 'Accede a manuales, guías, normativas y material de capacitación' }}</p>
      </div>

      <div v-if="loading" class="loading-container">
        <q-spinner-dots color="primary" size="60px" />
        <p class="loading-text">Cargando documentos...</p>
      </div>

      <div v-else-if="Object.keys(documentsByCategory).length === 0" class="empty-state">
        <q-icon name="folder_open" size="80px" color="grey-5" />
        <p class="empty-text">No hay documentos disponibles en este momento</p>
      </div>

      <div v-else class="categories-container">
        <q-tabs
          v-model="activeCategory"
          dense
          class="category-tabs"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab
            v-for="category in categories"
            :key="category"
            :name="category"
            :label="category"
            class="category-tab"
          />
        </q-tabs>

        <q-separator class="q-my-md" />

        <q-tab-panels v-model="activeCategory" animated class="bg-transparent">
          <q-tab-panel
            v-for="category in categories"
            :key="category"
            :name="category"
            class="q-pa-none"
          >
            <div class="documents-grid">
              <div
                v-for="doc in documentsByCategory[category]"
                :key="doc.id"
                class="document-card"
              >
                <div class="document-icon" :style="{ backgroundColor: getFileTypeColor(doc.file_type) }">
                  <q-icon :name="getFileTypeIcon(doc.file_type)" size="32px" color="white" />
                </div>
                
                <div class="document-content">
                  <h3 class="document-title">{{ doc.title }}</h3>
                  <div v-if="doc.description" class="document-description" v-html="doc.description"></div>
                  
                  <div class="document-meta">
                    <q-chip
                      :color="getFileTypeColor(doc.file_type)"
                      text-color="white"
                      size="sm"
                      dense
                    >
                      {{ doc.file_type }}
                    </q-chip>
                    <span class="document-size">{{ doc.file_size }}</span>
                  </div>
                </div>

                <div class="document-actions">
                  <q-btn
                    round
                    color="primary"
                    icon="download"
                    size="md"
                    @click="downloadDocument(doc)"
                    class="download-btn"
                  >
                    <q-tooltip>Descargar</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>

            <div v-if="documentsByCategory[category].length === 10" class="view-more-container">
              <p class="view-more-text">Mostrando los 10 documentos más recientes de esta categoría</p>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../boot/axios'
import { getResourceUrl } from '../utils/urlHelper'

const props = defineProps({
  title: String,
  subtitle: String,
  bgSettings: Object,
  titleColor: String
})

const sectionStyle = computed(() => {
  if (!props.bgSettings) return { backgroundColor: '#f8f9fa' }
  
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
  
  return { backgroundColor: color || '#f8f9fa' }
})

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const loading = ref(false)
const documentsByCategory = ref({})
const activeCategory = ref('')

const categories = computed(() => Object.keys(documentsByCategory.value))

const fileTypeConfig = {
  PDF: { icon: 'picture_as_pdf', color: '#e74c3c' },
  DOC: { icon: 'description', color: '#3498db' },
  DOCX: { icon: 'description', color: '#3498db' },
  XLS: { icon: 'table_chart', color: '#27ae60' },
  XLSX: { icon: 'table_chart', color: '#27ae60' },
  ZIP: { icon: 'folder_zip', color: '#9b59b6' },
  default: { icon: 'insert_drive_file', color: '#95a5a6' }
}

function getFileTypeIcon(type) {
  return fileTypeConfig[type]?.icon || fileTypeConfig.default.icon
}

function getFileTypeColor(type) {
  return fileTypeConfig[type]?.color || fileTypeConfig.default.color
}

function downloadDocument(doc) {
  window.open(getResourceUrl(doc.file_url), '_blank')
}

async function fetchDocuments() {
  loading.value = true
  try {
    const response = await api.get('/documents/by-category')
    documentsByCategory.value = response.data
    
    // Set first category as active
    const cats = Object.keys(response.data)
    if (cats.length > 0) {
      activeCategory.value = cats[0]
    }
  } catch (error) {
    console.error('Error loading documents:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchDocuments)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.documents-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 80px 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
  animation: fadeInUp 0.6s ease-out;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #6c757d;
  font-weight: 500;
  margin: 0;
  animation: fadeInUp 0.6s ease-out 0.1s both;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.loading-text {
  font-size: 1.05rem;
  color: #667eea;
  font-weight: 600;
  margin-top: 16px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-text {
  font-size: 1.1rem;
  color: #6c757d;
  margin-top: 20px;
}

.categories-container {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.5s ease-out;
}

.category-tabs {
  margin-bottom: 8px;
}

.category-tab {
  font-weight: 600;
  font-size: 0.95rem;
  text-transform: none;
  letter-spacing: 0;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.document-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.document-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.document-card:hover::before {
  transform: scaleY(1);
}

.document-icon {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.document-content {
  flex: 1;
  min-width: 0;
}

.document-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px;
  line-height: 1.4;
}

.document-description {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0 0 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.document-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.document-size {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

.document-actions {
  flex-shrink: 0;
}

.download-btn {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.download-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.view-more-container {
  margin-top: 32px;
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 12px;
}

.view-more-text {
  font-size: 0.95rem;
  color: #667eea;
  font-weight: 600;
  margin: 0;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .documents-section {
    padding: 60px 0;
  }

  .section-title {
    font-size: 2rem;
  }

  .section-subtitle {
    font-size: 1rem;
  }

  .categories-container {
    padding: 20px;
    border-radius: 16px;
  }

  .documents-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .document-card {
    padding: 20px;
    gap: 16px;
  }

  .document-icon {
    width: 56px;
    height: 56px;
  }

  .document-title {
    font-size: 1rem;
  }

  .category-tab {
    font-size: 0.85rem;
    padding: 8px 12px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.75rem;
  }

  .document-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .document-actions {
    width: 100%;
    display: flex;
    justify-content: center;
  }
}
</style>
