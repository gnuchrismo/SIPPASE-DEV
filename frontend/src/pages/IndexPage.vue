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
  <main id="main">
    <!-- HERO / SLIDER -->
    <section id="inicio" class="hero">
      <div class="hero-inner wrap">
        <!-- HERO LEFT (Text) -->
        <div class="hero-left">
          <h1>{{ settings.hero_title }}</h1>
          <p class="lead">{{ settings.hero_description }}</p>
          <div class="ctas">
            <a class="btn btn-primary" :href="settings.hero_btn1_link">{{ settings.hero_btn1_text }}</a>
            <a class="btn btn-outline" :href="settings.hero_btn2_link">{{ settings.hero_btn2_text }}</a>
          </div>
        </div>

        <!-- HERO RIGHT (Slider) -->
        <div class="hero-right">
          <div class="carousel-container relative-position">
            
            <div v-if="loadingSliders" class="flex flex-center" style="height: 500px">
              <q-spinner color="primary" size="3em" />
            </div>

            <q-carousel
              v-else-if="sliders.length > 0"
              v-model="slide"
              transition-prev="slide-right"
              transition-next="slide-left"
              swipeable
              animated
              height="500px"
              class="bg-transparent shadow-none hero-carousel"
              autoplay
              infinite
              ref="carousel"
            >
              <q-carousel-slide 
                v-for="(slider, index) in sliders" 
                :key="slider.id" 
                :name="index" 
                class="column no-wrap flex-center q-pa-none"
              >
                <!-- Reference Design: Glass Frame + White Card -->
                <div class="glass-frame flex flex-center">
                  <div class="content-card column flex-center text-center">
                    
                    <!-- Icon/Image Section -->
                    <div class="card-icon-wrapper q-mb-md">
                      <img :src="getSliderImage(slider.image_url)" :alt="slider.title" class="card-icon-img">
                    </div>
                    
                    <!-- Text Section -->
                    <h3 class="card-title text-primary">{{ slider.title }}</h3>
                    <div class="card-desc text-grey-7" v-html="slider.description"></div>
                    
                    <!-- CTA Button -->
                    <q-btn 
                      label="Más información" 
                      icon-right="arrow_forward" 
                      class="btn-cta-modern q-mt-lg full-width"
                      no-caps
                      @click="openDetails(slider)"
                    />
                  </div>
                </div>
              </q-carousel-slide>
              
              <!-- Custom Navigation: Side Arrows -->
              <template v-slot:control>
                <q-carousel-control position="left" :offset="[16, 0]" class="flex flex-center full-height" style="pointer-events: none">
                   <q-btn
                    round dense flat
                    color="white" 
                    text-color="primary"
                    icon="chevron_left"
                    class="slider-arrow cursor-pointer"
                    style="pointer-events: auto"
                    @click="$refs.carousel.previous()"
                  />
                </q-carousel-control>
                
                <q-carousel-control position="right" :offset="[16, 0]" class="flex flex-center full-height" style="pointer-events: none">
                  <q-btn
                    round dense flat
                    color="white" 
                    text-color="primary"
                    icon="chevron_right"
                    class="slider-arrow cursor-pointer"
                    style="pointer-events: auto"
                    @click="$refs.carousel.next()"
                  />
                </q-carousel-control>
                
                <!-- Bottom Dots -->
                <q-carousel-control position="bottom" :offset="[0, 16]" class="text-center">
                  <div class="q-gutter-xs">
                    <q-btn
                      v-for="(slider, index) in sliders"
                      :key="index"
                      round dense flat
                      :class="['slider-dot', { active: index === slide }]"
                      size="8px"
                      @click="slide = index"
                    />
                  </div>
                </q-carousel-control>
              </template>
            </q-carousel>
          </div>

          <!-- Dialog for Full Details -->
          <q-dialog v-model="detailsOpen" backdrop-filter="blur(4px)">
            <q-card style="width: 700px; max-width: 90vw; border-radius: 24px">
              <q-card-section class="row items-center q-pb-none">
                <div class="text-h6 text-primary text-weight-bold">{{ selectedSlide.title }}</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
              </q-card-section>

              <q-card-section class="q-pa-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-5 flex flex-center">
                     <img 
                      :src="getSliderImage(selectedSlide.image_url)" 
                      class="full-width" 
                      style="max-height: 250px; object-fit: contain"
                    >
                  </div>
                  <div class="col-12 col-md-7">
                    <div class="text-body1 text-grey-8" style="white-space: pre-line" v-html="selectedSlide.description"></div>
                    
                    <div class="q-mt-md" v-if="selectedSlide.link_url && selectedSlide.link_url !== '#'">
                      <a :href="selectedSlide.link_url" target="_blank" class="btn-cta-modern" style="display:inline-flex; text-decoration:none; height:40px; align-items:center; justify-content:center; padding: 0 24px">
                        Ir al sitio oficial
                        <q-icon name="open_in_new" size="xs" class="q-ml-sm" />
                      </a>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-dialog>

          <div v-if="!loadingSliders && sliders.length === 0" class="flex flex-center text-grey-7" style="height: 300px">
            <p>No hay información destacada disponible.</p>
          </div>
      </div>
    </div>
    </section>

    <!-- OTHER SECTIONS -->
    <NewsSection 
      v-if="settings.section_news_is_active !== 'false'"
      :title="settings.section_news_title" :subtitle="settings.section_news_subtitle" :title-color="settings.section_news_title_color" :bg-settings="getSectionBgSettings('section_news')"
    />
    <SystemsSection 
      v-if="settings.section_systems_is_active !== 'false'"
      :title="settings.section_systems_title" :subtitle="settings.section_systems_subtitle" :title-color="settings.section_systems_title_color" :bg-settings="getSectionBgSettings('section_systems')"
    />
    <TutorialsSection 
      v-if="settings.section_tutorials_is_active !== 'false'"
      :title="settings.section_tutorials_title" :subtitle="settings.section_tutorials_subtitle" :title-color="settings.section_tutorials_title_color" :bg-settings="getSectionBgSettings('section_tutorials')"
    />
    <DocumentsSection 
      v-if="settings.section_docs_is_active !== 'false'"
      :title="settings.section_docs_title" :subtitle="settings.section_docs_subtitle" :title-color="settings.section_docs_title_color" :bg-settings="getSectionBgSettings('section_docs')"
    />
    <NationalStatisticsSection 
      v-if="settings.section_stats_is_active !== 'false'"
      :title="settings.section_stats_title" :subtitle="settings.section_stats_subtitle" :title-color="settings.section_stats_title_color" :section-id="settings.section_stats_id"
    />

    <!-- CONTACTO -->
    <section 
      v-if="settings.section_contact_is_active !== 'false'"
      id="contacto" 
      class="section light"
      :style="{ backgroundColor: settings.section_contact_bg_color || '#f8f9fa' }"
    >
      <div class="wrap">
        <!-- New Visual Hierarchy -->
        <div class="text-center q-mb-xl">
          <h2 class="contact-title" :style="{ color: settings.section_contact_title_color || '#0f172a' }">
            {{ settings.section_contact_title || 'Contacto' }}
          </h2>
          <p class="contact-subtitle">{{ settings.section_contact_subtitle || '¿Necesitas ayuda o tienes consultas? Contáctanos' }}</p>
        </div>
        
        <!-- Premium Card -->
        <div class="contact-card">
          <q-form @submit="submitContactForm" class="q-pa-lg q-pa-md-xl">
            <!-- Increased Gutter -->
            <div class="row q-col-gutter-x-xl q-col-gutter-y-xl">
              
              <!-- Name -->
              <div class="col-12 col-md-6">
                 <div>
                   <label class="q-field__label" for="contact-name">Nombre completo</label>
                   <q-input
                    id="contact-name"
                    v-model="contactForm.name"
                    placeholder="Ej: Juan Pérez"
                    outlined
                    class="premium-input-field"
                    :rules="[val => !!val || 'Requerido']"
                    hide-bottom-space
                  />
                 </div>
              </div>

              <!-- Phone Group (Composite) -->
              <div class="col-12 col-md-6">
                <div>
                  <label class="q-field__label" for="contact-phone">Teléfono (WhatsApp)</label>
                  <div class="phone-group">
                    <!-- Country Selector -->
                    <q-select
                      v-model="selectedCountry"
                      :options="countries"
                      option-label="code"
                      option-value="code"
                      borderless
                      dense
                      class="country-select-simple"
                      behavior="menu"
                    >
                      <template v-slot:selected>
                         <div class="row items-center no-wrap">
                           <span class="text-h6 emoji-flag">{{ selectedCountry.flag }}</span>
                           <q-icon name="arrow_drop_down" size="xs" color="grey-6" />
                         </div>
                      </template>
                      <template v-slot:option="scope">
                         <q-item v-bind="scope.itemProps" class="country-item">
                           <q-item-section avatar><span class="text-h6 emoji-flag">{{ scope.opt.flag }}</span></q-item-section>
                           <q-item-section>
                             <q-item-label class="text-weight-medium text-body2">{{ scope.opt.name }}</q-item-label>
                           </q-item-section>
                         </q-item>
                       </template>
                    </q-select>

                    <!-- Prefix Box -->
                    <div class="phone-prefix row items-center justify-center">
                      {{ selectedCountry.code }}
                    </div>

                    <!-- Number Input (Fills remaining space) -->
                    <q-input
                      id="contact-phone"
                      v-model="phoneNumber"
                      placeholder="Número"
                      outlined
                      class="premium-input-field col"
                      mask="##############"
                      unmasked-value
                      hide-bottom-space
                      borderless
                    />
                  </div>
                </div>
              </div>

              <!-- Email -->
              <div class="col-12 col-md-6">
                 <div>
                   <label class="q-field__label" for="contact-email">Correo electrónico</label>
                   <q-input
                    id="contact-email"
                    v-model="contactForm.email"
                    placeholder="ejemplo@correo.com"
                    type="email"
                    outlined
                    class="premium-input-field"
                    :rules="[
                      val => !!val || 'Requerido',
                      val => /.+@.+\..+/.test(val) || 'Invalido'
                    ]"
                    hide-bottom-space
                  />
                 </div>
              </div>

              <!-- System -->
              <div class="col-12 col-md-6">
                <div>
                   <label class="q-field__label" for="contact-system">Sistema de interés (Opcional)</label>
                   <q-select
                    id="contact-system"
                    v-model="contactForm.system"
                    :options="systemOptions"
                    placeholder="Seleccione un sistema"
                    outlined
                    clearable
                    option-value="id"
                    option-label="name"
                    emit-value
                    map-options
                    class="premium-input-field"
                    :loading="loadingSystems"
                    behavior="menu"
                    hide-bottom-space
                  />
                </div>
              </div>
              
              <!-- Message -->
              <div class="col-12">
                 <div>
                   <label class="q-field__label" for="contact-message">Mensaje</label>
                   <q-input
                    id="contact-message"
                    v-model="contactForm.message"
                    placeholder="Escriba su consulta aquí..."
                    type="textarea"
                    outlined
                    rows="4"
                    class="premium-input-field"
                    :rules="[val => !!val || 'Requerido']"
                    hide-bottom-space
                  />
                 </div>
              </div>
              
              <!-- Submit Button -->
              <div class="col-12 text-center q-mt-lg">
                <q-btn
                  type="submit"
                  label="ENVIAR MENSAJE"
                  color="primary"
                  :loading="submittingForm"
                  :disable="submittingForm"
                  class="send-btn"
                  icon-right="send"
                  no-caps
                />
              </div>
            </div>
          </q-form>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../boot/axios'
import { getResourceUrl } from '../utils/urlHelper'
import SystemsSection from '../components/SystemsSection.vue'
import NewsSection from '../components/NewsSection.vue'
import DocumentsSection from '../components/DocumentsSection.vue'
import NationalStatisticsSection from '../components/NationalStatisticsSection.vue'
import TutorialsSection from '../components/TutorialsSection.vue'

const slide = ref(0)
const loadingSliders = ref(false)
const sliders = ref([])
const detailsOpen = ref(false)
const selectedSlide = ref({})
/* --- Countries List --- */
const countries = [
  { name: 'Bolivia', code: '+591', flag: '🇧🇴' },
  { name: 'Argentina', code: '+54', flag: '🇦🇷' },
  { name: 'Brasil', code: '+55', flag: '🇧🇷' },
  { name: 'Chile', code: '+56', flag: '🇨🇱' },
  { name: 'Colombia', code: '+57', flag: '🇨🇴' },
  { name: 'Ecuador', code: '+593', flag: '🇪🇨' },
  { name: 'Paraguay', code: '+595', flag: '🇵🇾' },
  { name: 'Perú', code: '+51', flag: '🇵🇪' },
  { name: 'Uruguay', code: '+598', flag: '🇺🇾' },
  { name: 'Venezuela', code: '+58', flag: '🇻🇪' },
  { name: 'Estados Unidos', code: '+1', flag: '🇺🇸' },
  { name: 'España', code: '+34', flag: '🇪🇸' },
  { name: 'México', code: '+52', flag: '🇲🇽' },
];

const selectedCountry = ref(countries[0]) // Default: Bolivia
const phoneNumber = ref('')

function openDetails(sliderItem) {
  selectedSlide.value = sliderItem
  detailsOpen.value = true
}

const settings = ref({
  hero_title: 'Protección, atención y seguimiento — SIPPASE',
  hero_description: 'Sistema integral de registro y herramientas institucionales para la prevención y erradicación de todo tipo de violencia en Bolivia.',
  hero_btn1_text: 'Conoce los sistemas',
  hero_btn1_link: '#sistemas',
  hero_btn2_text: 'Solicitar ayuda',
  hero_btn2_link: '#contacto',
})

const contactForm = ref({ name: '', email: '', message: '', system: null })
const systemOptions = ref([])
const loadingSystems = ref(false)
const submittingForm = ref(false)

function getSectionBgSettings(prefix) {
  return {
    type: settings.value[`${prefix}_bg_type`] || 'solid',
    color: settings.value[`${prefix}_bg_color`] || '#ffffff',
    gradientType: settings.value[`${prefix}_gradient_type`] || 'linear',
    gradientDirection: settings.value[`${prefix}_gradient_direction`] || 'to bottom',
    gradientColor1: settings.value[`${prefix}_gradient_color1`] || '#667eea',
    gradientColor2: settings.value[`${prefix}_gradient_color2`] || '#764ba2',
    image: settings.value[`${prefix}_bg_image`] || '',
    imageSize: settings.value[`${prefix}_bg_size`] || 'cover',
    overlay: settings.value[`${prefix}_bg_overlay`] || '#000000',
    overlayOpacity: settings.value[`${prefix}_bg_overlay_opacity`] || 50
  }
}

function getSliderImage(path) {
  return path ? getResourceUrl(path) : '/assets/svg/shield.svg';
}

async function fetchSliders() {
  loadingSliders.value = true;
  try {
    const response = await api.get('/sliders');
    sliders.value = response.data.filter(s => s.is_active);
  } catch (error) { console.error(error) } 
  finally { loadingSliders.value = false; }
}

async function fetchSettings() {
  try {
    const response = await api.get('/settings')
    if (response.data) settings.value = { ...settings.value, ...response.data }
  } catch (error) { console.error(error) }
}

async function fetchSystems() {
  loadingSystems.value = true
  try {
    const response = await api.get('/systems')
    systemOptions.value = response.data.filter(s => s.is_active)
  } catch (error) { console.error(error) } 
  finally { loadingSystems.value = false }
}

async function submitContactForm() {
  submittingForm.value = true
  try {
    const fullPhone = phoneNumber.value ? `${selectedCountry.value.code} ${phoneNumber.value}` : null;
    const payload = {
      name: contactForm.value.name,
      email: contactForm.value.email,
      phone: fullPhone,
      message: contactForm.value.message,
      system_id: contactForm.value.system || null
    }
    await api.post('/contacts/submit', payload)
    import('quasar').then(({ Notify }) => {
      Notify.create({ type: 'positive', message: '¡Mensaje enviado exitosamente!', position: 'top', icon: 'check_circle' })
    })
    contactForm.value = { name: '', email: '', message: '', system: null }
    phoneNumber.value = ''
    selectedCountry.value = countries[0] 
  } catch (error) {
    import('quasar').then(({ Notify }) => {
      Notify.create({ type: 'negative', message: 'Error al enviar mensaje.', position: 'top', icon: 'error' })
    })
  } finally { submittingForm.value = false }
}

onMounted(() => { fetchSettings(); fetchSliders(); fetchSystems(); })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* Keeping previous Hero Styles */
.glass-frame {
  width: 100%; height: 100%; padding: 20px;
  background: rgba(255, 255, 255, 0.1); border-radius: 40px;
  backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1); display: flex; align-items: center; justify-content: center;
}
.content-card { background: white; border-radius: 32px; padding: 40px 32px; width: 100%; max-width: 420px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12); }
.card-icon-wrapper { height: 120px; width: 100%; display: flex; align-items: center; justify-content: center; }
.card-icon-img { max-height: 100%; max-width: 100%; object-fit: contain; }
.card-title { font-family: 'Inter'; font-weight: 800; font-size: 1.75rem; color: #6C1DF2; margin: 12px 0 8px; }
.card-desc { font-family: 'Inter'; font-size: 0.95rem; line-height: 1.5; margin-bottom: 8px; }
.btn-cta-modern { background: #6C1DF2; color: white; border-radius: 12px; font-weight: 700; transition: all 0.2s ease; }
.carousel-container { padding-bottom: 30px; }

/* === NEW VISUAL HIERARCHY STYLES === */

/* 1. Typography */
.contact-title { font-family: 'Inter', sans-serif; font-size: 2.2rem; font-weight: 700; margin: 0; line-height: 1.2; }
.contact-subtitle { margin-top: 8px; font-size: 1.1rem; color: #6b7280; font-weight: 400; }

/* 2. Card */
.contact-card {
  max-width: 1000px; margin: 0 auto;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.98));
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
  position: relative; z-index: 10;
}

/* 3. Inputs Unified Language */
.premium-input-field :deep(.q-field__control) {
  border-radius: 14px;
  background: #f8fafc;
  transition: all 0.25s ease;
  height: 56px; /* Consistency */
}
.premium-input-field :deep(.q-field__control:before) { border-color: transparent; } /* Clean look */
.premium-input-field :deep(.q-field__control:hover:before) { border-color: #cbd5e0; }

/* Focus State */
.premium-input-field.q-field--focused :deep(.q-field__control) {
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
}

/* 4. Phone Group (Composite Input) */
.phone-group {
  display: flex; gap: 8px; align-items: center; width: 100%;
}

/* The country selector itself, transparent so it acts like a button */
.country-select-simple { 
  width: auto;
}
.country-select-simple :deep(.q-field__control) {
  background: transparent !important; padding: 0 4px; min-height: auto; height: 56px;
}
.emoji-flag { font-size: 1.6rem; vertical-align: middle; }

/* The Prefix Box */
.phone-prefix {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 0 16px;
  font-weight: 600;
  color: #334155;
  height: 56px;
  display: flex;
  align-items: center;
}

/* Ensure Phone Input matches height and style but has no extra margins */
.premium-input-field.col :deep(.q-field__control) {
  height: 56px;
}

/* 5. Labels */
.q-field__label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.2px;
  display: block; margin-bottom: 8px;
}

/* 6. Submit Button */
.send-btn {
  border-radius: 999px; /* Pill shape */
  padding: 14px 48px;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(124, 58, 237, 0.35);
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  transition: all 0.3s ease;
}
.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(124, 58, 237, 0.45);
}

@media (max-width: 599px) {
  .contact-title { font-size: 1.8rem; }
  .contact-card { padding: 0; box-shadow: none; background: transparent; }
}
</style>
