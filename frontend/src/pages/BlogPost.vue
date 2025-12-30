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
  <main id="main" class="blog-post-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <q-spinner-dots color="primary" size="80px" />
      <p class="loading-text">Cargando publicación...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <q-icon name="error_outline" size="80px" color="negative" />
      <h2>Publicación no encontrada</h2>
      <p>La publicación que buscas no existe o ha sido eliminada.</p>
      <q-btn color="primary" label="Volver a noticias" icon="arrow_back" @click="goBack" />
    </div>

    <!-- Blog Post Content -->
    <article v-else-if="post" class="blog-post">
      <!-- Hero Header -->
      <div class="post-hero">
        <div class="post-hero-overlay"></div>
        <img 
          v-if="post.featured_image_url" 
          :src="getImageUrl(post.featured_image_url)" 
          :alt="post.title"
          class="post-hero-image"
        />
        <div class="post-hero-content wrap">
          <q-chip :color="getCategoryColor(post.category)" text-color="white" class="category-chip">
            {{ post.category }}
          </q-chip>
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-meta">
            <span class="meta-item">
              <q-icon name="event" size="20px" />
              {{ formatDate(post.published_at) }}
            </span>
            <span v-if="post.author_name" class="meta-item">
              <q-icon name="person" size="20px" />
              {{ post.author_name }}
            </span>
            <span class="meta-item">
              <q-icon name="visibility" size="20px" />
              {{ post.view_count || 0 }} vistas
            </span>
          </div>
        </div>
      </div>

      <!-- Post Content -->
      <div class="post-content-wrapper wrap">
        <div class="post-main">
          <!-- Summary -->
          <div v-if="post.summary" class="post-summary">
            <p>{{ post.summary }}</p>
          </div>

          <!-- Content -->
          <div class="post-content" v-html="post.content"></div>

          <!-- Media Attachments -->
          <div v-if="media.length > 0" class="post-media-section">
            <h2 class="media-section-title">
              <q-icon name="attachment" size="28px" />
              Archivos Adjuntos
            </h2>

            <div class="media-grid">
              <!-- Documents -->
              <div 
                v-for="item in media.filter(m => m.media_type === 'document')" 
                :key="item.id"
                class="media-card document-card"
              >
                <div class="media-card-icon">
                  <q-icon name="description" size="40px" color="blue" />
                </div>
                <div class="media-card-content">
                  <h4>{{ item.media_title || item.title }}</h4>
                  <p v-if="item.description">{{ item.description }}</p>
                  <q-btn 
                    color="primary" 
                    icon="download" 
                    label="Descargar" 
                    @click="downloadFile(item.media_url)"
                    size="sm"
                  />
                </div>
              </div>

              <!-- Videos -->
              <div 
                v-for="item in media.filter(m => m.media_type === 'video')" 
                :key="item.id"
                class="media-card video-card"
              >
                <div class="media-card-icon">
                  <q-icon name="videocam" size="40px" color="purple" />
                </div>
                <div class="media-card-content">
                  <h4>{{ item.media_title || item.title }}</h4>
                  <p v-if="item.description">{{ item.description }}</p>
                  <video v-if="item.media_url" controls class="media-video">
                    <source :src="getImageUrl(item.media_url)" type="video/mp4">
                    Tu navegador no soporta el elemento de video.
                  </video>
                </div>
              </div>

              <!-- YouTube Videos -->
              <div 
                v-for="item in media.filter(m => m.media_type === 'youtube')" 
                :key="item.id"
                class="media-card youtube-card"
              >
                <div class="media-card-content">
                  <h4>{{ item.title || 'Video de YouTube' }}</h4>
                  <p v-if="item.description">{{ item.description }}</p>
                  <div class="youtube-container">
                    <iframe
                      :src="getYouTubeEmbed(item.youtube_url)"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Share Section -->
          <div class="post-share">
            <h3>Compartir</h3>
            <div class="share-buttons">
              <q-btn 
                round 
                color="primary" 
                icon="share" 
                @click="sharePost"
                title="Compartir"
              />
              <q-btn 
                round 
                color="blue-9" 
                icon="facebook" 
                @click="shareOnFacebook"
                title="Compartir en Facebook"
              />
              <q-btn 
                round 
                color="light-blue-9" 
                icon="link" 
                @click="copyLink"
                title="Copiar enlace"
              />
            </div>
          </div>

          <!-- Back Button -->
          <div class="post-actions">
            <q-btn 
              outline 
              color="primary" 
              icon="arrow_back" 
              label="Volver a noticias" 
              @click="goBack"
              size="lg"
            />
          </div>
        </div>
      </div>
    </article>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../boot/axios'
import { getResourceUrl } from '../utils/urlHelper'
import { useQuasar, useMeta } from 'quasar'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const loading = ref(false)
const error = ref(false)
const post = ref(null)
const media = ref([])

useMeta(() => {
  if (!post.value) return {}
  
  const title = post.value.title
  const description = post.value.summary || post.value.title
  const image = post.value.featured_image_url ? getImageUrl(post.value.featured_image_url) : ''
  const url = window.location.href

  return {
    title: title,
    meta: {
      description: { name: 'description', content: description },
      // Open Graph
      ogTitle: { property: 'og:title', content: title },
      ogDescription: { property: 'og:description', content: description },
      ogImage: { property: 'og:image', content: image },
      ogUrl: { property: 'og:url', content: url },
      ogType: { property: 'og:type', content: 'article' },
      // Twitter
      twitterCard: { name: 'twitter:card', content: 'summary_large_image' },
      twitterTitle: { name: 'twitter:title', content: title },
      twitterDescription: { name: 'twitter:description', content: description },
      twitterImage: { name: 'twitter:image', content: image }
    }
  }
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
  if (!path) return ''
  return getResourceUrl(path)
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

function getYouTubeEmbed(url) {
  if (!url) return ''
  const videoId = extractYouTubeId(url)
  return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
}

function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

function downloadFile(url) {
  if (!url) return
  window.open(getImageUrl(url), '_blank')
}

function goBack() {
  router.push('/')
}

function sharePost() {
  if (navigator.share) {
    navigator.share({
      title: post.value.title,
      text: post.value.summary,
      url: window.location.href
    }).catch(err => console.log('Error sharing:', err))
  } else {
    copyLink()
  }
}

function shareOnFacebook() {
  const url = encodeURIComponent(window.location.href)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    $q.notify({
      type: 'positive',
      message: 'Enlace copiado al portapapeles',
      position: 'top',
      timeout: 2000
    })
  })
}

async function fetchPost() {
  loading.value = true
  error.value = false
  try {
    const response = await api.get(`/blog/post/${route.params.slug}`)
    post.value = response.data
    
    // Fetch media if post has media
    if (post.value.id) {
      const mediaResponse = await api.get(`/blog/posts/${post.value.id}/media`)
      media.value = mediaResponse.data
    }
  } catch (err) {
    console.error('Error loading post:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(fetchPost)
</script>

<style scoped>
.blog-post-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.loading-text {
  font-size: 1.1rem;
  color: #667eea;
  font-weight: 600;
  margin-top: 16px;
}

.error-container h2 {
  font-size: 2rem;
  color: #2d3748;
  margin: 20px 0 10px;
}

.error-container p {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 30px;
}

/* Hero Section */
.post-hero {
  position: relative;
  height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.post-hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.3;
}

.post-hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7));
}

.post-hero-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 60px;
  color: white;
}

.category-chip {
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
  align-self: flex-start;
}

.post-title {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.2;
  margin: 0 0 24px;
  color: white;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  font-size: 1rem;
  opacity: 0.95;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Content Section */
.post-content-wrapper {
  margin-top: -40px;
  position: relative;
  z-index: 2;
}

.post-main {
  background: white;
  border-radius: 20px;
  padding: 60px;
  box-shadow: 0 4px 30px rgba(0,0,0,0.1);
  max-width: 900px;
  margin: 0 auto;
}

.post-summary {
  font-size: 1.25rem;
  line-height: 1.8;
  color: #4a5568;
  font-weight: 500;
  padding: 24px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  border-left: 4px solid #667eea;
  border-radius: 8px;
  margin-bottom: 40px;
}

.post-summary p {
  margin: 0;
}

.post-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #2d3748;
  margin-bottom: 60px;
}

.post-content :deep(h1),
.post-content :deep(h2),
.post-content :deep(h3) {
  color: #2d3748;
  font-weight: 700;
  margin-top: 40px;
  margin-bottom: 20px;
}

.post-content :deep(h1) { font-size: 2.2rem; }
.post-content :deep(h2) { font-size: 1.8rem; }
.post-content :deep(h3) { font-size: 1.4rem; }

.post-content :deep(p) {
  margin-bottom: 20px;
}

.post-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 30px 0;
}

.post-content :deep(a) {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  transition: border-color 0.3s ease;
}

.post-content :deep(a:hover) {
  border-bottom-color: #667eea;
}

/* Media Section */
.post-media-section {
  margin: 60px 0;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 16px;
}

.media-section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 30px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.media-grid {
  display: grid;
  gap: 24px;
}

.media-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transition: all 0.3s ease;
}

.media-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.document-card,
.video-card {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.media-card-icon {
  flex-shrink: 0;
}

.media-card-content {
  flex: 1;
}

.media-card-content h4 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px;
}

.media-card-content p {
  font-size: 0.95rem;
  color: #6c757d;
  margin: 0 0 16px;
}

.media-video {
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
  margin-top: 12px;
}

.youtube-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 12px;
  margin-top: 12px;
}

.youtube-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Share Section */
.post-share {
  margin: 60px 0 40px;
  padding-top: 40px;
  border-top: 2px solid #e2e8f0;
}

.post-share h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 20px;
}

.share-buttons {
  display: flex;
  gap: 12px;
}

/* Actions */
.post-actions {
  margin-top: 40px;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .post-hero {
    height: 400px;
  }

  .post-title {
    font-size: 2rem;
  }

  .post-main {
    padding: 30px 20px;
    border-radius: 16px;
  }

  .post-summary {
    font-size: 1.1rem;
    padding: 20px;
  }

  .post-content {
    font-size: 1rem;
  }

  .post-media-section {
    padding: 24px 20px;
  }

  .document-card,
  .video-card {
    flex-direction: column;
  }
}
</style>
