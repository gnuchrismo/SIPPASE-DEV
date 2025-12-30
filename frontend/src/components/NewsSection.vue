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
    id="noticias" 
    class="section news-section"
    :style="sectionStyle"
  >
    <div class="wrap">
      <div class="section-header">
        <h2 
          class="section-title"
          :style="{ color: titleColor || '#2d3748' }"
        >
          {{ title || '📰 Noticias y Actualidad' }}
        </h2>
        <p class="section-subtitle">{{ subtitle || 'Mantente informado sobre las últimas noticias y eventos' }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <q-spinner-dots color="primary" size="60px" />
        <p class="loading-text">Cargando noticias...</p>
      </div>

      <!-- News Grid -->
      <div v-else-if="posts.length > 0" class="news-grid">
        <article v-for="post in posts" :key="post.id" class="news-card" @click="goToPost(post.slug)">
          <div class="news-card-image">
            <img 
              :src="getImageUrl(post.featured_image_url)" 
              :alt="post.title"
              @error="handleImageError"
            />
            <div class="news-card-overlay">
              <q-chip :color="getCategoryColor(post.category)" text-color="white" dense class="category-chip">
                {{ post.category }}
              </q-chip>
            </div>
          </div>

          <div class="news-card-content">
            <div class="news-meta">
              <span class="news-date">
                <q-icon name="event" size="16px" />
                {{ formatDate(post.published_at) }}
              </span>
              <span v-if="post.media_count > 0" class="news-media">
                <q-icon name="attachment" size="16px" />
                {{ post.media_count }}
              </span>
            </div>

            <h3 class="news-title">{{ post.title }}</h3>
            
            <p class="news-summary">{{ getSummary(post) }}</p>

            <div class="news-footer">
              <span class="news-author" v-if="post.author_name">
                <q-icon name="person" size="16px" />
                {{ post.author_name }}
              </span>
              <span class="news-read-more">
                Leer más
                <q-icon name="arrow_forward" size="16px" />
              </span>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <q-icon name="article" size="80px" color="grey-5" />
        <p class="empty-text">No hay noticias disponibles en este momento</p>
      </div>

      <!-- View More Button -->
      <div v-if="posts.length > 0 && pagination.hasNext" class="view-more-container">
        <q-btn 
          outline 
          color="primary" 
          label="Ver más noticias" 
          icon-right="arrow_forward"
          size="lg"
          @click="loadMore"
          :loading="loadingMore"
          class="view-more-btn"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../boot/axios'
import { getResourceUrl } from '../utils/urlHelper'
import { useRouter } from 'vue-router'

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

const router = useRouter()
const loading = ref(false)
const loadingMore = ref(false)
const posts = ref([])
const pagination = ref({
  page: 1,
  limit: 6,
  hasNext: false
})

function getCategoryColor(category) {
  const colors = {
    'Noticias': 'blue',
    'Eventos': 'purple',
    'Comunicados': 'orange',
    'Capacitación': 'green',
    'Informes': 'teal'
  }
  return colors[category] || 'grey'
}

function getImageUrl(path) {
  if (!path) return '/assets/svg/news-placeholder.svg'
  return getResourceUrl(path)
}

function handleImageError(event) {
  event.target.src = '/assets/svg/news-placeholder.svg'
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function stripHtmlTags(text) {
  if (!text) return ''
  return text.replace(/<[^>]*>/g, '') // Remove HTML tags
}

function truncateContent(content) {
  if (!content) return ''
  const text = stripHtmlTags(content)
  return text.length > 150 ? text.substring(0, 150) + '...' : text
}

function getSummary(post) {
  const summary = post.summary || post.content
  const cleanText = stripHtmlTags(summary)
  return cleanText.length > 150 ? cleanText.substring(0, 150) + '...' : cleanText
}

function goToPost(slug) {
  router.push(`/noticias/${slug}`)
}

async function fetchPosts() {
  loading.value = true
  try {
    const response = await api.get('/blog/published', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.limit
      }
    })
    posts.value = response.data.items
    pagination.value.hasNext = response.data.pagination.hasNext
  } catch (error) {
    console.error('Error loading news:', error)
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  loadingMore.value = true
  try {
    pagination.value.page++
    const response = await api.get('/blog/published', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.limit
      }
    })
    posts.value.push(...response.data.items)
    pagination.value.hasNext = response.data.pagination.hasNext
  } catch (error) {
    console.error('Error loading more news:', error)
  } finally {
    loadingMore.value = false
  }
}

onMounted(fetchPosts)
</script>

<style scoped>
.news-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 80px 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 16px;
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #6c757d;
  font-weight: 500;
  margin: 0;
}

.loading-container {
  text-align: center;
  padding: 60px 0;
}

.loading-text {
  font-size: 1.05rem;
  color: #667eea;
  font-weight: 600;
  margin-top: 16px;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 32px;
  margin-bottom: 48px;
}

.news-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.news-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
}

.news-card-image {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.news-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.news-card:hover .news-card-image img {
  transform: scale(1.05);
}

.news-card-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1;
}

.category-chip {
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.news-card-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 0.85rem;
  color: #6c757d;
}

.news-date,
.news-media {
  display: flex;
  align-items: center;
  gap: 4px;
}

.news-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-summary {
  font-size: 0.95rem;
  color: #4a5568;
  line-height: 1.6;
  margin: 0 0 20px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.news-author {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

.news-read-more {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 700;
  transition: gap 0.3s ease;
}

.news-card:hover .news-read-more {
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-text {
  font-size: 1.1rem;
  color: #6c757d;
  margin-top: 16px;
}

.view-more-container {
  text-align: center;
  margin-top: 48px;
}

.view-more-btn {
  font-weight: 700;
  padding: 12px 40px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.view-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .news-section {
    padding: 60px 0;
  }

  .section-title {
    font-size: 2rem;
  }

  .news-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .news-card-image {
    height: 200px;
  }
}
</style>
