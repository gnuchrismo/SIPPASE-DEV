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
  <div v-if="loadingMenu" class="fullscreen flex flex-center bg-white" style="z-index: 9999">
    <loading-logo :logo-url="settings.logo_main_url" />
  </div>

  <q-layout v-else view="hHh lpR fff">
    <header class="site-header" role="banner">
      <div class="wrap header-inner">
        <a class="brand" :href="settings.logo_main_link || '/'" @click.prevent="handleLogoClick">
          <img 
            :src="settings.logo_main_url || '/assets/images/logo.png'" 
            alt="SIPPASE" 
            class="logo"
            :style="{ height: (settings.logo_main_height || 48) + 'px' }"
          >
        </a>

        <nav class="nav" role="navigation" aria-label="Principal">
          <ul class="nav-list" id="navList" :class="{ open: menuOpen }">
            <li v-for="item in publicMenuItems" :key="item.id">
              <a 
                v-if="item.route_path && item.route_path.startsWith('#')"
                :href="item.route_path" 
                class="nav-link"
                :class="{ active: isActiveAnchor(item.route_path) }"
                @click="handleAnchorClick(item.route_path)"
              >
                <q-icon v-if="item.icon" :name="item.icon" size="18px" class="nav-icon" />
                {{ item.title }}
              </a>
              <router-link 
                v-else-if="item.route_path"
                :to="item.route_path" 
                class="nav-link"
                :class="{ active: isActiveRoute(item.route_path) }"
              >
                <q-icon v-if="item.icon" :name="item.icon" size="18px" class="nav-icon" />
                {{ item.title }}
              </router-link>
              <a 
                v-else-if="item.external_url"
                :href="item.external_url" 
                class="nav-link"
                :target="item.open_in_new_tab ? '_blank' : '_self'"
                :rel="item.open_in_new_tab ? 'noopener noreferrer' : ''"
              >
                <q-icon v-if="item.icon" :name="item.icon" size="18px" class="nav-icon" />
                {{ item.title }}
                <q-icon v-if="item.open_in_new_tab" name="open_in_new" size="14px" class="external-icon" />
              </a>

              <!-- Submenu if has children -->
              <ul v-if="item.children && item.children.length > 0" class="submenu">
                <li v-for="child in item.children" :key="child.id">
                  <a 
                    v-if="child.route_path && child.route_path.startsWith('#')"
                    :href="child.route_path" 
                    class="submenu-link"
                    @click="handleAnchorClick(child.route_path)"
                  >
                    {{ child.title }}
                  </a>
                  <router-link 
                    v-else-if="child.route_path"
                    :to="child.route_path" 
                    class="submenu-link"
                  >
                    {{ child.title }}
                  </router-link>
                  <a 
                    v-else-if="child.external_url"
                    :href="child.external_url" 
                    class="submenu-link"
                    :target="child.open_in_new_tab ? '_blank' : '_self'"
                  >
                    {{ child.title }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>

        <div class="actions row items-center q-gutter-sm">
          <template v-if="!authStore.token">
              <q-btn flat no-caps color="primary" label="Acceso Usuarios" icon="person" @click="showAuthModal = true" class="gt-xs" />
              <a class="btn-cta" href="#sistemas">Acceso a Sistemas</a>
          </template>
          <template v-else>
              <q-btn-dropdown flat no-caps color="primary" :label="authStore.user?.username || 'Usuario'" icon="account_circle">
                  <q-list>
                      <q-item clickable v-close-popup to="/admin">
                          <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
                          <q-item-section>Panel de Control</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="logout">
                          <q-item-section avatar><q-icon name="logout" /></q-item-section>
                          <q-item-section>Cerrar Sesión</q-item-section>
                      </q-item>
                  </q-list>
              </q-btn-dropdown>
          </template>

          <button 
            id="hamburger" 
            aria-label="Abrir menú" 
            :aria-expanded="menuOpen" 
            class="hamburger" 
            :class="{ active: menuOpen }"
            @click="toggleMenu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>

    <AuthModal v-model="showAuthModal" />

    <q-page-container>
      <router-view />
    </q-page-container>

    <footer class="site-footer" role="contentinfo">
      <div class="wrap footer-grid">
        <div>
          <a :href="settings.logo_footer_link || '/'">
            <img 
              :src="settings.logo_footer_url || '/assets/images/logo.png'" 
              alt="SIPPASE" 
              style="margin-bottom:12px;"
              :style="{ height: (settings.logo_footer_height || 48) + 'px' }"
            >
          </a>
          <p style="opacity: 0.95;">Sistema Integral de Prevención, Atención y Seguimiento para la Erradicación de la Violencia</p>
        </div>

        <!-- Dynamic Footer Columns -->
        <div v-for="column in footerMenuItems" :key="column.id">
          <h4>{{ column.title }}</h4>
          <ul class="footer-links">
            <li v-for="item in column.children" :key="item.id">
              <a 
                v-if="item.route_path && item.route_path.startsWith('#')"
                :href="item.route_path"
                @click="handleAnchorClick(item.route_path)"
              >
                {{ item.title }}
              </a>
              <router-link 
                v-else-if="item.route_path"
                :to="item.route_path"
              >
                {{ item.title }}
              </router-link>
              <a 
                v-else-if="item.external_url"
                :href="item.external_url"
                :target="item.open_in_new_tab ? '_blank' : '_self'"
              >
                {{ item.title }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Contact Column (From Settings) -->
        <div>
          <h4>Contacto</h4>
          
          <!-- Contact Items with Icons -->
          <div class="contact-items">
            <div v-if="settings.contact_email" class="contact-item">
              <div class="contact-icon-wrapper">
                <q-icon name="email" size="20px" />
              </div>
              <div class="contact-info">
                <div class="contact-label">Email</div>
                <a 
                  :href="`mailto:${settings.contact_email}`" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="contact-link"
                >
                  {{ settings.contact_email }}
                </a>
              </div>
            </div>

            <div v-if="settings.contact_phone" class="contact-item">
              <div class="contact-icon-wrapper">
                <q-icon name="phone" size="20px" />
              </div>
              <div class="contact-info">
                <div class="contact-label">Línea Gratuita</div>
                <a 
                  :href="`tel:${settings.contact_phone.replace(/\s/g, '')}`" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="contact-link"
                >
                  {{ settings.contact_phone }}
                </a>
              </div>
            </div>

            <div v-if="settings.contact_emergency" class="contact-item">
              <div class="contact-icon-wrapper emergency">
                <q-icon name="emergency" size="20px" />
              </div>
              <div class="contact-info">
                <div class="contact-label">Emergencias</div>
                <a 
                  :href="`tel:${settings.contact_emergency.replace(/\s/g, '')}`" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="contact-link"
                >
                  {{ settings.contact_emergency }}
                </a>
              </div>
            </div>
          </div>

          <!-- Social Media -->
          <div v-if="settings.social_facebook || settings.social_twitter || settings.social_linkedin || settings.social_instagram || settings.social_youtube" class="social-section">
            <div class="social-label">Síguenos</div>
            <div class="socials">
              <a v-if="settings.social_facebook" :href="settings.social_facebook" aria-label="Facebook" class="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 5 3.66 9.14 8.44 9.93v-7.04H8.14V12.07h2.3V9.89c0-2.28 1.36-3.54 3.44-3.54.99 0 2.03.18 2.03.18v2.23h-1.14c-1.12 0-1.47.7-1.47 1.42v1.72h2.5l-.4 2.89h-2.1v7.04C18.34 21.21 22 17.07 22 12.07z" fill="currentColor"/>
                </svg>
              </a>
              <a v-if="settings.social_twitter" :href="settings.social_twitter" aria-label="Twitter" class="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M22 5.92c-.66.3-1.37.5-2.12.59.76-.46 1.34-1.19 1.62-2.06-.71.42-1.5.73-2.34.9C18.66 4.5 17.66 4 16.56 4c-1.56 0-2.82 1.27-2.82 2.83 0 .22.02.44.07.65C10.9 7.36 8.08 5.7 6.2 3.12c-.24.42-.38.92-.38 1.45 0 .99.5 1.86 1.27 2.37-.47-.01-.91-.15-1.3-.36v.04c0 1.4.99 2.57 2.31 2.84-.24.07-.49.11-.75.11-.18 0-.35-.02-.52-.05.35 1.09 1.35 1.89 2.53 1.91C8.2 16.4 6.66 17.1 4.98 17.1c-.33 0-.66-.02-.98-.06 1.14.73 2.5 1.15 3.96 1.15 4.75 0 7.36-3.94 7.36-7.35v-.34c.5-.36.93-.8 1.28-1.32z" fill="currentColor"/>
                </svg>
              </a>
              <a v-if="settings.social_linkedin" :href="settings.social_linkedin" aria-label="LinkedIn" class="social-icon" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20.45 20.45h-3.6v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85v5.5h-3.6V9h3.46v1.56h.05c.48-.9 1.66-1.85 3.42-1.85 3.66 0 4.34 2.42 4.34 5.58v6.16zM5.34 7.43c-1.15 0-2.07-.94-2.07-2.09 0-1.15.92-2.09 2.07-2.09 1.14 0 2.06.94 2.06 2.09 0 1.15-.92 2.09-2.06 2.09zM7.14 20.45H3.53V9h3.61v11.45z" fill="currentColor"/>
                </svg>
              </a>
              <a v-if="settings.social_instagram" :href="settings.social_instagram" aria-label="Instagram" class="social-icon" target="_blank" rel="noopener noreferrer">
                <q-icon name="camera_alt" size="20px" />
              </a>
              <a v-if="settings.social_youtube" :href="settings.social_youtube" aria-label="YouTube" class="social-icon" target="_blank" rel="noopener noreferrer">
                <q-icon name="smart_display" size="20px" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="wrap" style="text-align:center;margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);">
        <small style="opacity: 0.9;">© 2025 SIPPASE — Sistema Integral de Prevención, Atención y Seguimiento. Todos los derechos reservados.</small>
        <div style="margin-top: 8px; opacity: 0.7; font-size: 11px;">
          Potenciado por <strong>ROBITCMS</strong>
        </div>
      </div>
    </footer>
    <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 18]">
      <q-btn fab icon="keyboard_arrow_up" class="btn-gradient" aria-label="Volver arriba" />
    </q-page-scroller>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../boot/axios'
import { useMeta } from 'quasar'
import LoadingLogo from '../components/LoadingLogo.vue'
import { useAuthStore } from '../stores/authStore'
import AuthModal from '../components/AuthModal.vue'

const route = useRoute()
const router = useRouter()
const menuOpen = ref(false)
const publicMenu = ref({})
const footerMenu = ref({})
const loadingMenu = ref(true)
const settings = ref({})
const activeAnchor = ref('')
const authStore = useAuthStore()
const showAuthModal = ref(false)

const logout = () => {
    authStore.logout();
    window.location.reload();
}

// Initialize useMeta synchronously in setup phase with reactive favicon
const faviconUrl = computed(() => settings.value.favicon_url || '/favicon.ico')

// Call useMeta synchronously during setup, not inside async callbacks
// Call useMeta synchronously during setup
useMeta(() => {
  const s = settings.value;
  const title = s.seo_title_default || 'Sippase Portal';
  const titleTemplate = s.seo_title_template ? (title) => s.seo_title_template.replace('%s', title) : (title) => `${title} | Sippase`;
  const description = s.seo_description_default || 'Bienvenido al portal Sippase.';
  const keywords = s.seo_keywords_default || 'sippase, portal, bus';
  const image = s.seo_og_image || '/assets/images/logo.png';
  const url = window.location.href;

  return {
    title: title,
    titleTemplate: titleTemplate,
    meta: {
      description: { name: 'description', content: description },
      keywords: { name: 'keywords', content: keywords },
      // Open Graph
      ogTitle: { property: 'og:title', content: title },
      ogDescription: { property: 'og:description', content: description },
      ogImage: { property: 'og:image', content: image },
      ogUrl: { property: 'og:url', content: url },
      ogType: { property: 'og:type', content: 'website' },
      // Twitter
      twitterCard: { name: 'twitter:card', content: 'summary_large_image' },
      twitterTitle: { name: 'twitter:title', content: title },
      twitterDescription: { name: 'twitter:description', content: description },
      twitterImage: { name: 'twitter:image', content: image }
    },
    link: {
      icon: { 
        type: 'image/png', 
        href: faviconUrl.value 
      }
    }
  };
})

const publicMenuItems = computed(() => {
  const mainMenu = publicMenu.value['public-main']
  return mainMenu?.items || getDefaultPublicMenu()
})

const footerMenuItems = computed(() => {
  const footer = footerMenu.value['public-footer']
  return footer?.items || getDefaultFooterMenu()
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleLogoClick() {
  if (settings.value.logo_main_link && settings.value.logo_main_link !== '/') {
    window.location.href = settings.value.logo_main_link
  } else {
    if (route.path === '/') {
      scrollToTop()
    } else {
      router.push('/')
    }
  }
}

function handleAnchorClick(anchor) {
  menuOpen.value = false
  
  // Set active anchor
  activeAnchor.value = anchor
  
  // Remove the # from anchor
  const targetId = anchor.substring(1)
  const element = document.getElementById(targetId)
  
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function isActiveRoute(path) {
  // Special handling for home page ('/') route
  // The home page link should only be active when:
  // 1. We are on the home page (route.path === '/')
  // 2. AND no anchor is currently active (activeAnchor is empty or '#inicio')
  if (path === '/') {
    return route.path === '/' && (!activeAnchor.value || activeAnchor.value === '#inicio')
  }
  
  // For all other routes, use exact match
  return route.path === path
}

function isActiveAnchor(anchor) {
  // Only apply anchor active state when on home page
  // This prevents anchor state from interfering with router navigation
  if (route.path !== '/') {
    return false
  }
  
  // An anchor is active if:
  // 1. It matches the current activeAnchor value
  // 2. OR if it's #inicio and no other anchor is set (top of home page)
  if (anchor === '#inicio') {
    return !activeAnchor.value || activeAnchor.value === '#inicio'
  }
  
  return activeAnchor.value === anchor
}

async function loadPublicMenu() {
  loadingMenu.value = true
  try {
    const response = await api.get('/menus/public')
    
    // Check if response has data
    if (response.data && typeof response.data === 'object') {
      // Separate menus by location
      Object.keys(response.data).forEach(key => {
        const menu = response.data[key]
        if (menu && menu.location === 'public') {
          publicMenu.value[key] = menu
        } else if (menu && menu.location === 'footer') {
          footerMenu.value[key] = menu
        }
      })
    } else {
      // Use default menus if response is invalid
      console.warn('Invalid menu data received, using defaults')
      publicMenu.value = { 'public-main': { items: getDefaultPublicMenu() } }
      footerMenu.value = { 'public-footer': { items: getDefaultFooterMenu() } }
    }
  } catch (error) {
    console.warn('Menu API not available, using default menus:', error.message)
    // Use default menus on error - this is not critical, so just warn
    publicMenu.value = { 'public-main': { items: getDefaultPublicMenu() } }
    footerMenu.value = { 'public-footer': { items: getDefaultFooterMenu() } }
  } finally {
    loadingMenu.value = false
  }
}

async function loadSettings() {
  try {
    const response = await api.get('/settings')
    settings.value = response.data
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

function getDefaultPublicMenu() {
  return [
    { id: 1, title: 'Inicio', icon: 'home', route_path: '/' },
    { id: 2, title: 'Sistemas', icon: 'apps', route_path: '#sistemas' },
    { id: 3, title: 'Documentos', icon: 'description', route_path: '#documentos' },
    { id: 4, title: 'Estadísticas', icon: 'bar_chart', route_path: '/estadisticas' },
    { id: 5, title: 'Contacto', icon: 'mail', route_path: '#contacto' }
  ]
}

function getDefaultFooterMenu() {
  return [
    {
      id: 1,
      title: 'Navegación',
      children: [
        { id: 11, title: 'Inicio', route_path: '/' },
        { id: 12, title: 'Sistemas', route_path: '#sistemas' },
        { id: 13, title: 'Documentos', route_path: '#documentos' },
        { id: 14, title: 'Estadísticas', route_path: '/estadisticas' }
      ]
    },
    {
      id: 2,
      title: 'Legal',
      children: [
        { id: 21, title: 'Normativa', route_path: '#documentos' },
        { id: 22, title: 'Política de Privacidad', route_path: '/page/privacidad' },
        { id: 23, title: 'Términos de Uso', route_path: '/page/terminos' }
      ]
    }
  ]
}

// Watch for route changes and clear activeAnchor when navigating away from home
watch(() => route.path, (newPath) => {
  // Clear active anchor when navigating to routes (not on home page)
  if (newPath !== '/') {
    activeAnchor.value = ''
  } else {
    // When returning to home page, detect which section is in view
    setTimeout(() => {
      updateActiveSection()
    }, 100)
  }
})

function updateActiveSection() {
  // Only track sections on the home page
  if (route.path !== '/') {
    return
  }
  
  // All possible sections on the home page
  const sections = ['inicio', 'noticias', 'sistemas', 'documentos', 'estadisticas', 'contacto']
  let currentSection = ''
  let closestSection = ''
  let closestDistance = Infinity
  
  // Find which section is currently in view (closest to center of viewport)
  sections.forEach((sectionId) => {
    const section = document.getElementById(sectionId)
    if (section) {
      const rect = section.getBoundingClientRect()
      const viewportCenter = window.innerHeight / 2
      
      // Calculate distance from section top to viewport center
      const distance = Math.abs(rect.top - viewportCenter)
      
      // If section is in viewport and closer to center than previous closest
      if (rect.top <= viewportCenter && rect.bottom >= 100 && distance < closestDistance) {
        closestDistance = distance
        closestSection = '#' + sectionId
      }
    }
  })
  
  // Update active anchor to the closest section
  if (closestSection) {
    activeAnchor.value = closestSection
  } else if (window.scrollY < 100) {
    // If at very top of page, default to inicio
    activeAnchor.value = '#inicio'
  }
}

onMounted(() => {
  loadPublicMenu()
  loadSettings()
  
  // Highlight active section on scroll (only on home page)
  window.addEventListener('scroll', () => {
    updateActiveSection()
  })
  
  // Set initial active section when component mounts
  if (route.path === '/') {
    setTimeout(() => {
      updateActiveSection()
    }, 100)
  }
})
</script>

<style scoped>
/* Enhanced Navigation Styles */
.site-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.brand {
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.brand:hover {
  transform: scale(1.05);
}

.logo {
  height: 48px;
  width: auto;
}

.nav-list {
  display: flex;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav-list li {
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 80%;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  transition: transform 0.3s ease;
}

.nav-link:hover {
  background: rgba(102, 126, 234, 0.08);
  color: #667eea;
}

.nav-link:hover::before,
.nav-link.active::before {
  transform: translateX(-50%) scaleX(1);
}

.nav-link.active {
  color: #667eea;
  font-weight: 600;
}

.nav-icon {
  opacity: 0.7;
}

.external-icon {
  opacity: 0.5;
  margin-left: 2px;
}

/* Submenu Styles */
.submenu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 8px;
  min-width: 200px;
  list-style: none;
  margin: 8px 0 0 0;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-list li:hover .submenu {
  display: block;
}

.submenu-link {
  display: block;
  padding: 10px 16px;
  color: #333;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.submenu-link:hover {
  background: rgba(102, 126, 234, 0.08);
  color: #667eea;
  transform: translateX(4px);
}

.btn-cta {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* Hamburger Menu */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background: #333;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(7px, 7px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

/* Footer Enhancements */
.site-footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  padding: 48px 24px 24px;
  margin-top: 60px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.footer-grid h4 {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  position: relative;
  padding-bottom: 8px;
}

.footer-grid h4::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
}

.footer-links a:hover {
  color: white;
  transform: translateX(4px);
}

/* Contact Items Styles */
.contact-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.contact-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.contact-icon-wrapper {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
}

.contact-icon-wrapper.emergency {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%);
}

.contact-item:hover .contact-icon-wrapper {
  transform: scale(1.1);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%);
}

.contact-item:hover .contact-icon-wrapper.emergency {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.5) 0%, rgba(220, 38, 38, 0.5) 100%);
}

.contact-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-link {
  color: rgba(255, 255, 255, 0.95);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  word-break: break-all;
}

.contact-link:hover {
  color: #667eea;
  text-decoration: underline;
}

/* Social Media Section */
.social-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.social-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.socials {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.social-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.social-icon:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  border-color: transparent;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .nav-list {
    display: none;
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: 20px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    max-height: calc(100vh - 80px);
    overflow-y: auto;
  }

  .nav-list.open {
    display: flex;
  }

  .nav-list li {
    width: 100%;
  }

  .nav-link {
    width: 100%;
    justify-content: flex-start;
  }

  .submenu {
    position: static;
    display: none;
    box-shadow: none;
    background: rgba(102, 126, 234, 0.05);
    margin: 8px 0;
  }

  .nav-list li:hover .submenu {
    display: block;
  }

  .hamburger {
    display: flex;
  }

  .btn-cta {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-inner {
    padding: 12px 16px;
  }

  .logo {
    height: 40px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.btn-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.btn-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}
</style>
