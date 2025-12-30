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
  <q-page class="page-view-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <q-spinner-dots size="50px" color="primary" />
      <p class="text-grey-7 q-mt-md">Cargando página...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <q-icon name="error_outline" size="80px" color="negative" />
      <h2 class="q-mt-md">Página no encontrada</h2>
      <p class="text-grey-7">La página que buscas no existe o no está disponible.</p>
      <q-btn 
        color="primary" 
        label="Volver al Inicio" 
        icon="home" 
        @click="$router.push('/')"
        class="q-mt-md"
      />
    </div>

    <!-- Page Content -->
    <div v-else-if="page" class="page-content">
      <!-- Breadcrumbs -->
      <div class="breadcrumbs q-mb-lg">
        <q-breadcrumbs>
          <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
          <q-breadcrumbs-el :label="page.title" />
        </q-breadcrumbs>
      </div>

      <!-- Page Header -->
      <div class="page-header q-mb-lg">
        <h1 class="page-title">{{ page.title }}</h1>
        <div class="page-meta text-grey-7">
          <span v-if="page.author_full_name || page.author_name">
            <q-icon name="person" size="18px" class="q-mr-xs" />
            {{ page.author_full_name || page.author_name }}
          </span>
          <span class="q-mx-sm">•</span>
          <span>
            <q-icon name="calendar_today" size="18px" class="q-mr-xs" />
            {{ formatDate(page.created_at) }}
          </span>
          <span v-if="page.updated_at !== page.created_at" class="q-mx-sm">•</span>
          <span v-if="page.updated_at !== page.created_at">
            <q-icon name="update" size="18px" class="q-mr-xs" />
            Actualizado: {{ formatDate(page.updated_at) }}
          </span>
        </div>
      </div>

      <!-- Page Body -->
      <div class="page-body" v-html="page.content"></div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../boot/axios'
import { useMeta } from 'quasar'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref(false)
const page = ref(null)

// SEO Meta Tags
const metaData = computed(() => {
  if (!page.value) return {}
  
  return {
    title: page.value.title,
    meta: {
      description: { name: 'description', content: page.value.meta_description || page.value.title },
      keywords: { name: 'keywords', content: page.value.meta_keywords || '' },
      ogTitle: { property: 'og:title', content: page.value.title },
      ogDescription: { property: 'og:description', content: page.value.meta_description || page.value.title },
      ogType: { property: 'og:type', content: 'article' }
    }
  }
})

useMeta(metaData)

async function fetchPage() {
  loading.value = true
  error.value = false
  
  try {
    const slug = route.params.slug
    const response = await api.get(`/pages/slug/${slug}`)
    page.value = response.data
  } catch (err) {
    console.error('Error fetching page:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchPage()
})
</script>

<style scoped>
.page-view-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.error-container h2 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.breadcrumbs {
  padding: 12px 0;
}

.page-header {
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 20px;
}

.page-title {
  font-size: 42px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.page-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 14px;
  gap: 4px;
}

.page-body {
  font-size: 18px;
  line-height: 1.8;
  color: #333;
  padding: 30px 0;
}

/* Rich Text Content Styling */
.page-body :deep(h1) {
  font-size: 36px;
  font-weight: 700;
  margin: 32px 0 16px 0;
  color: #1a1a1a;
}

.page-body :deep(h2) {
  font-size: 30px;
  font-weight: 600;
  margin: 28px 0 14px 0;
  color: #2a2a2a;
}

.page-body :deep(h3) {
  font-size: 24px;
  font-weight: 600;
  margin: 24px 0 12px 0;
  color: #3a3a3a;
}

.page-body :deep(h4) {
  font-size: 20px;
  font-weight: 600;
  margin: 20px 0 10px 0;
  color: #4a4a4a;
}

.page-body :deep(p) {
  margin: 16px 0;
}

.page-body :deep(ul),
.page-body :deep(ol) {
  margin: 16px 0;
  padding-left: 30px;
}

.page-body :deep(li) {
  margin: 8px 0;
}

.page-body :deep(a) {
  color: #1976d2;
  text-decoration: none;
  border-bottom: 1px solid #1976d2;
  transition: all 0.3s ease;
}

.page-body :deep(a:hover) {
  color: #0d47a1;
  border-bottom-color: #0d47a1;
}

.page-body :deep(blockquote) {
  border-left: 4px solid #1976d2;
  padding-left: 20px;
  margin: 20px 0;
  font-style: italic;
  color: #555;
  background: #f5f5f5;
  padding: 16px 20px;
  border-radius: 4px;
}

.page-body :deep(code) {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.page-body :deep(pre) {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 20px 0;
}

.page-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 20px 0;
}

.page-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.page-body :deep(table th),
.page-body :deep(table td) {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.page-body :deep(table th) {
  background: #f5f5f5;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-view-container {
    padding: 20px 16px;
  }

  .page-title {
    font-size: 32px;
  }

  .page-body {
    font-size: 16px;
  }

  .page-body :deep(h1) {
    font-size: 28px;
  }

  .page-body :deep(h2) {
    font-size: 24px;
  }

  .page-body :deep(h3) {
    font-size: 20px;
  }
}
</style>
