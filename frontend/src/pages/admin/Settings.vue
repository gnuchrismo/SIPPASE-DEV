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
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <div class="row items-center justify-between q-mb-lg">
          <div>
            <h1 class="text-h4 text-weight-bold text-primary q-my-none">Configuración del Sitio</h1>
            <p class="text-grey-7 q-mt-sm">Administra la identidad, áreas y contenido del portal</p>
          </div>
          <q-btn
            color="primary"
            icon="save"
            label="Guardar Cambios"
            :loading="saving"
            @click="saveSettings"
            unelevated
            class="q-px-md"
          />
        </div>

        <q-card class="my-card shadow-2" bordered>
          <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="identity" icon="palette" label="Identidad Visual" />
            <q-tab name="hero" icon="view_carousel" label="Sección Hero" />
            <q-tab name="areas" icon="layers" label="Áreas del Portal" />
            <q-tab name="contact" icon="contact_support" label="Contacto y Redes" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated>
            
            <!-- IDENTITY TAB -->
            <q-tab-panel name="identity" class="q-pa-lg">
              <div class="row q-col-gutter-xl">
                <!-- Main Logo -->
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="bg-grey-1 full-height">
                    <q-card-section>
                      <div class="text-h6 text-primary q-mb-md">Logo Principal (Navbar)</div>
                      
                      <div class="row q-col-gutter-md items-center">
                        <div class="col-auto">
                          <q-avatar square size="100px" class="bg-white shadow-1">
                            <img :src="settings.logo_main_url || '/assets/images/logo.png'" style="object-fit: contain; padding: 8px;">
                          </q-avatar>
                        </div>
                        <div class="col">
                          <q-input
                            v-model="settings.logo_main_url"
                            label="URL del Logo"
                            outlined
                            dense
                            readonly
                            class="q-mb-sm"
                          >
                            <template v-slot:append>
                              <q-btn round dense flat icon="image" @click="openMediaSelector('logo_main_url')" />
                            </template>
                          </q-input>
                          <div class="row q-col-gutter-sm">
                            <div class="col-6">
                              <q-input v-model="settings.logo_main_height" label="Altura (px)" outlined dense type="number" suffix="px" />
                            </div>
                            <div class="col-6">
                              <q-input v-model="settings.logo_main_link" label="Enlace al hacer clic" outlined dense placeholder="/" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Footer Logo -->
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="bg-grey-1 full-height">
                    <q-card-section>
                      <div class="text-h6 text-primary q-mb-md">Logo Pie de Página</div>
                      
                      <div class="row q-col-gutter-md items-center">
                        <div class="col-auto">
                          <q-avatar square size="100px" class="bg-dark shadow-1">
                            <img :src="settings.logo_footer_url || '/assets/images/logo.png'" style="object-fit: contain; padding: 8px;">
                          </q-avatar>
                        </div>
                        <div class="col">
                          <q-input
                            v-model="settings.logo_footer_url"
                            label="URL del Logo Footer"
                            outlined
                            dense
                            readonly
                            class="q-mb-sm"
                          >
                            <template v-slot:append>
                              <q-btn round dense flat icon="image" @click="openMediaSelector('logo_footer_url')" />
                            </template>
                          </q-input>
                          <div class="row q-col-gutter-sm">
                            <div class="col-6">
                              <q-input v-model="settings.logo_footer_height" label="Altura (px)" outlined dense type="number" suffix="px" />
                            </div>
                            <div class="col-6">
                              <q-input v-model="settings.logo_footer_link" label="Enlace al hacer clic" outlined dense placeholder="/" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Favicon -->
                <div class="col-12">
                  <q-card flat bordered class="bg-grey-1">
                    <q-card-section>
                      <div class="text-h6 text-primary q-mb-md">Favicon</div>
                      <div class="row q-col-gutter-md items-center">
                        <div class="col-auto">
                          <q-avatar square size="48px" class="bg-white shadow-1">
                            <img :src="settings.favicon_url || '/favicon.ico'" style="object-fit: contain;">
                          </q-avatar>
                        </div>
                        <div class="col">
                          <q-input
                            v-model="settings.favicon_url"
                            label="URL del Favicon"
                            outlined
                            dense
                            readonly
                            hint="Recomendado: .ico o .png de 32x32px"
                          >
                            <template v-slot:append>
                              <q-btn round dense flat icon="image" @click="openMediaSelector('favicon_url')" />
                            </template>
                          </q-input>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            color="secondary"
                            label="Aplicar Favicon"
                            icon="check_circle"
                            :loading="applyingFavicon"
                            @click="applyFavicon"
                            unelevated
                          >
                            <q-tooltip>Instalar favicon en el formato correcto</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- HERO SECTION TAB -->
            <q-tab-panel name="hero" class="q-pa-lg">
              <div class="row q-col-gutter-xl">
                <!-- Left Column: Form -->
                <div class="col-12 col-md-7">
                  <div class="text-h6 q-mb-md text-primary">Contenido Principal</div>
                  
                  <q-input
                    v-model="settings.hero_title"
                    label="Título Principal"
                    outlined
                    class="q-mb-md"
                    hint="El título grande que aparece al inicio"
                  >
                    <template v-slot:prepend>
                      <q-icon name="title" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="settings.hero_description"
                    label="Descripción"
                    outlined
                    type="textarea"
                    rows="4"
                    class="q-mb-lg"
                    hint="Breve descripción debajo del título"
                  />

                  <q-separator class="q-my-lg" />

                  <div class="text-h6 q-mb-md text-primary">Botones de Acción</div>
                  
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6">
                      <q-card flat bordered class="bg-grey-1">
                        <q-card-section>
                          <div class="text-subtitle2 q-mb-sm">Botón Primario</div>
                          <q-input
                            v-model="settings.hero_btn1_text"
                            label="Texto"
                            outlined
                            dense
                            class="q-mb-sm"
                          />
                          <q-input
                            v-model="settings.hero_btn1_link"
                            label="Enlace / ID"
                            outlined
                            dense
                          />
                        </q-card-section>
                      </q-card>
                    </div>
                    
                    <div class="col-12 col-sm-6">
                      <q-card flat bordered class="bg-grey-1">
                        <q-card-section>
                          <div class="text-subtitle2 q-mb-sm">Botón Secundario</div>
                          <q-input
                            v-model="settings.hero_btn2_text"
                            label="Texto"
                            outlined
                            dense
                            class="q-mb-sm"
                          />
                          <q-input
                            v-model="settings.hero_btn2_link"
                            label="Enlace / ID"
                            outlined
                            dense
                          />
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </div>

                <!-- Right Column: Preview Hint -->
                <div class="col-12 col-md-5">
                  <q-card flat class="bg-primary text-white q-pa-md rounded-borders">
                    <q-card-section>
                      <div class="text-h6 q-mb-sm">Vista Previa (Aproximada)</div>
                      <div class="preview-box q-pa-md" style="border: 1px dashed rgba(255,255,255,0.5); border-radius: 8px;">
                        <h2 class="text-h4 text-weight-bold q-mt-none q-mb-sm">{{ settings.hero_title || 'Título...' }}</h2>
                        <p class="text-body1 q-mb-md" style="opacity: 0.9;">{{ settings.hero_description || 'Descripción...' }}</p>
                        <div class="row q-gutter-sm">
                          <q-btn :label="settings.hero_btn1_text || 'Botón 1'" color="white" text-color="primary" unelevated size="sm" />
                          <q-btn :label="settings.hero_btn2_text || 'Botón 2'" outline color="white" size="sm" />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

            <!-- AREAS TAB - ENHANCED -->
            <q-tab-panel name="areas" class="q-pa-lg">
              <div class="text-h6 q-mb-md text-primary">Personalización de Secciones</div>
              <p class="text-grey-7 q-mb-lg">Edita los títulos, subtítulos y estilos visuales de cada área del portal.</p>

              <div class="row q-col-gutter-lg">
                <div class="col-12" v-for="area in areas" :key="area.id">
                  <q-card bordered class="shadow-2 section-card" :class="{ 'section-inactive': settings[area.prefix + '_is_active'] === 'false' }">
                    <q-card-section class="bg-gradient-primary text-white">
                      <div class="row items-center justify-between">
                        <div class="row items-center">
                          <q-icon :name="area.icon" size="32px" class="q-mr-md" />
                          <div>
                            <div class="text-h6 text-weight-bold">{{ area.name }}</div>
                            <q-badge 
                              :color="settings[area.prefix + '_is_active'] === 'false' ? 'grey-6' : 'positive'"
                              :label="settings[area.prefix + '_is_active'] === 'false' ? 'Inactiva' : 'Activa'"
                              class="q-mt-xs"
                            >
                              <q-icon 
                                :name="settings[area.prefix + '_is_active'] === 'false' ? 'visibility_off' : 'visibility'" 
                                size="14px" 
                                class="q-mr-xs"
                              />
                            </q-badge>
                          </div>
                        </div>
                        <div class="row items-center q-gutter-sm">
                          <q-toggle
                            v-model="settings[area.prefix + '_is_active']"
                            true-value="true"
                            false-value="false"
                            color="white"
                            size="lg"
                            keep-color
                          >
                            <q-tooltip>{{ settings[area.prefix + '_is_active'] === 'false' ? 'Activar sección' : 'Desactivar sección' }}</q-tooltip>
                          </q-toggle>
                        </div>
                      </div>
                    </q-card-section>
                    <q-separator />
                    <q-card-section class="q-pa-lg">
                      <div class="row q-col-gutter-lg">
                        <!-- Left Column: Content -->
                        <div class="col-12 col-md-6">
                          <div class="text-subtitle1 text-weight-bold q-mb-md">📝 Contenido</div>
                          <q-input 
                            v-model="settings[area.prefix + '_id']" 
                            label="ID de Sección" 
                            outlined 
                            dense 
                            class="q-mb-md"
                            hint="ID único para enlazar desde el menú (ej: noticias, sistemas)"
                          >
                            <template v-slot:prepend>
                              <q-icon name="tag" />
                            </template>
                          </q-input>
                          <q-input 
                            v-model="settings[area.prefix + '_title']" 
                            label="Título de la Sección" 
                            outlined 
                            dense 
                            class="q-mb-md"
                          />
                          <q-input 
                            v-model="settings[area.prefix + '_subtitle']" 
                            label="Subtítulo / Descripción" 
                            outlined 
                            dense 
                            type="textarea" 
                            rows="2" 
                            class="q-mb-md"
                          />
                          <q-input
                            v-model="settings[area.prefix + '_title_color']"
                            label="Color del Título"
                            outlined
                            dense
                            readonly
                          >
                            <template v-slot:append>
                              <q-icon name="colorize" class="cursor-pointer" :style="{ color: settings[area.prefix + '_title_color'] }">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                  <q-color v-model="settings[area.prefix + '_title_color']" />
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                          </q-input>
                        </div>

                        <!-- Right Column: Background Styling -->
                        <div class="col-12 col-md-6">
                          <div class="text-subtitle1 text-weight-bold q-mb-md">🎨 Estilo de Fondo</div>
                          
                          <!-- Background Type Selector -->
                          <q-option-group
                            v-model="settings[area.prefix + '_bg_type']"
                            :options="bgTypeOptions"
                            color="primary"
                            inline
                            dense
                            class="q-mb-md"
                          />

                          <!-- Solid Color Option -->
                          <div v-if="settings[area.prefix + '_bg_type'] === 'solid'" class="bg-option-container">
                            <q-input
                              v-model="settings[area.prefix + '_bg_color']"
                              label="Color de Fondo"
                              outlined
                              dense
                              readonly
                            >
                              <template v-slot:append>
                                <q-icon name="colorize" class="cursor-pointer" :style="{ color: settings[area.prefix + '_bg_color'] }">
                                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                    <q-color v-model="settings[area.prefix + '_bg_color']" />
                                  </q-popup-proxy>
                                </q-icon>
                              </template>
                            </q-input>
                          </div>

                          <!-- Gradient Option -->
                          <div v-if="settings[area.prefix + '_bg_type'] === 'gradient'" class="bg-option-container">
                            <q-select
                              v-model="settings[area.prefix + '_gradient_type']"
                              :options="gradientTypeOptions"
                              label="Tipo de Degradado"
                              outlined
                              dense
                              class="q-mb-sm"
                            />
                            <q-select
                              v-if="settings[area.prefix + '_gradient_type'] === 'linear'"
                              v-model="settings[area.prefix + '_gradient_direction']"
                              :options="gradientDirectionOptions"
                              label="Dirección"
                              outlined
                              dense
                              class="q-mb-sm"
                            />
                            <div class="row q-col-gutter-sm q-mb-sm">
                              <div class="col-6">
                                <q-input
                                  v-model="settings[area.prefix + '_gradient_color1']"
                                  label="Color 1"
                                  outlined
                                  dense
                                  readonly
                                >
                                  <template v-slot:append>
                                    <q-icon name="colorize" class="cursor-pointer" :style="{ color: settings[area.prefix + '_gradient_color1'] }">
                                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-color v-model="settings[area.prefix + '_gradient_color1']" />
                                      </q-popup-proxy>
                                    </q-icon>
                                  </template>
                                </q-input>
                              </div>
                              <div class="col-6">
                                <q-input
                                  v-model="settings[area.prefix + '_gradient_color2']"
                                  label="Color 2"
                                  outlined
                                  dense
                                  readonly
                                >
                                  <template v-slot:append>
                                    <q-icon name="colorize" class="cursor-pointer" :style="{ color: settings[area.prefix + '_gradient_color2'] }">
                                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-color v-model="settings[area.prefix + '_gradient_color2']" />
                                      </q-popup-proxy>
                                    </q-icon>
                                  </template>
                                </q-input>
                              </div>
                            </div>
                            <!-- Gradient Preview -->
                            <div 
                              class="gradient-preview" 
                              :style="getGradientPreviewStyle(area.prefix)"
                            >
                              Vista Previa del Degradado
                            </div>
                          </div>

                          <!-- Image Option -->
                          <div v-if="settings[area.prefix + '_bg_type'] === 'image'" class="bg-option-container">
                            <q-input
                              v-model="settings[area.prefix + '_bg_image']"
                              label="URL de Imagen de Fondo"
                              outlined
                              dense
                              readonly
                              class="q-mb-sm"
                            >
                              <template v-slot:append>
                                <q-btn round dense flat icon="image" @click="openMediaSelector(area.prefix + '_bg_image')" />
                              </template>
                            </q-input>
                            <q-select
                              v-model="settings[area.prefix + '_bg_size']"
                              :options="bgSizeOptions"
                              label="Ajuste de Imagen"
                              outlined
                              dense
                              class="q-mb-sm"
                            />
                            <div class="row q-col-gutter-sm">
                              <div class="col-8">
                                <q-input
                                  v-model="settings[area.prefix + '_bg_overlay']"
                                  label="Color de Overlay (opcional)"
                                  outlined
                                  dense
                                  readonly
                                >
                                  <template v-slot:append>
                                    <q-icon name="colorize" class="cursor-pointer" :style="{ color: settings[area.prefix + '_bg_overlay'] }">
                                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-color v-model="settings[area.prefix + '_bg_overlay']" />
                                      </q-popup-proxy>
                                    </q-icon>
                                  </template>
                                </q-input>
                              </div>
                              <div class="col-4">
                                <q-input
                                  v-model.number="settings[area.prefix + '_bg_overlay_opacity']"
                                  label="Opacidad %"
                                  outlined
                                  dense
                                  type="number"
                                  min="0"
                                  max="100"
                                  suffix="%"
                                />
                              </div>
                            </div>
                            <!-- Image Preview -->
                            <div 
                              v-if="settings[area.prefix + '_bg_image']"
                              class="image-preview q-mt-sm" 
                              :style="getImagePreviewStyle(area.prefix)"
                            >
                              Vista Previa de Imagen
                            </div>
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>



            <!-- CONTACT & SOCIALS TAB -->
            <q-tab-panel name="contact" class="q-pa-lg">
              <div class="row q-col-gutter-xl">
                <!-- Contact Info -->
                <div class="col-12 col-md-6">
                  <div class="text-h6 text-primary q-mb-md">Información de Contacto</div>
                  <q-card flat bordered class="bg-grey-1">
                    <q-card-section>
                      <q-input
                        v-model="settings.contact_email"
                        label="Correo Electrónico"
                        outlined
                        dense
                        class="q-mb-md"
                      >
                        <template v-slot:prepend>
                          <q-icon name="email" />
                        </template>
                      </q-input>

                      <q-input
                        v-model="settings.contact_phone"
                        label="Línea Gratuita / Teléfono"
                        outlined
                        dense
                        class="q-mb-md"
                      >
                        <template v-slot:prepend>
                          <q-icon name="phone" />
                        </template>
                      </q-input>

                      <q-input
                        v-model="settings.contact_emergency"
                        label="Número de Emergencias"
                        outlined
                        dense
                      >
                        <template v-slot:prepend>
                          <q-icon name="local_hospital" />
                        </template>
                      </q-input>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Social Media -->
                <div class="col-12 col-md-6">
                  <div class="text-h6 text-primary q-mb-md">Redes Sociales</div>
                  <q-card flat bordered class="bg-grey-1">
                    <q-card-section>
                      <q-input
                        v-model="settings.social_facebook"
                        label="Facebook URL"
                        outlined
                        dense
                        class="q-mb-md"
                      >
                        <template v-slot:prepend>
                          <q-icon name="facebook" />
                        </template>
                      </q-input>

                      <q-input
                        v-model="settings.social_twitter"
                        label="Twitter / X URL"
                        outlined
                        dense
                        class="q-mb-md"
                      >
                        <template v-slot:prepend>
                          <q-icon name="flutter_dash" /> <!-- Using flutter_dash as X alternative or just generic -->
                        </template>
                      </q-input>

                      <q-input
                        v-model="settings.social_linkedin"
                        label="LinkedIn URL"
                        outlined
                        dense
                        class="q-mb-md"
                      >
                        <template v-slot:prepend>
                          <q-icon name="work" />
                        </template>
                      </q-input>

                      <q-input
                        v-model="settings.social_instagram"
                        label="Instagram URL"
                        outlined
                        dense
                        class="q-mb-md"
                      >
                        <template v-slot:prepend>
                          <q-icon name="camera_alt" />
                        </template>
                      </q-input>

                      <q-input
                        v-model="settings.social_youtube"
                        label="YouTube URL"
                        outlined
                        dense
                      >
                        <template v-slot:prepend>
                          <q-icon name="smart_display" />
                        </template>
                      </q-input>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-tab-panel>

          </q-tab-panels>
        </q-card>
      </div>
    </div>

    <!-- Media Selector Dialog -->
    <MediaSelector v-model="mediaSelectorOpen" @select="handleMediaSelect" />

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../../boot/axios'
import { useQuasar } from 'quasar'
import MediaSelector from '../../components/admin/MediaSelector.vue'

const $q = useQuasar()
const tab = ref('identity')
const saving = ref(false)
const applyingFavicon = ref(false)
const mediaSelectorOpen = ref(false)
const currentMediaField = ref(null)

const bgTypeOptions = [
  { label: 'Color Sólido', value: 'solid' },
  { label: 'Degradado', value: 'gradient' },
  { label: 'Imagen', value: 'image' }
]

const gradientTypeOptions = [
  { label: 'Linear', value: 'linear' },
  { label: 'Radial', value: 'radial' }
]

const gradientDirectionOptions = [
  { label: 'Arriba a Abajo', value: 'to bottom' },
  { label: 'Izquierda a Derecha', value: 'to right' },
  { label: 'Diagonal ↘', value: 'to bottom right' },
  { label: 'Diagonal ↙', value: 'to bottom left' },
  { label: 'Abajo a Arriba', value: 'to top' },
  { label: 'Derecha a Izquierda', value: 'to left' }
]

const bgSizeOptions = [
  { label: 'Cubrir (Cover)', value: 'cover' },
  { label: 'Contener (Contain)', value: 'contain' },
  { label: 'Repetir (Repeat)', value: 'repeat' }
]

const settings = ref({
  // Hero
  hero_title: '',
  hero_description: '',
  hero_btn1_text: '',
  hero_btn1_link: '',
  hero_btn2_text: '',
  hero_btn2_link: '',
  
  // Identity
  logo_main_url: '',
  logo_main_height: '48',
  logo_main_link: '/',
  logo_footer_url: '',
  logo_footer_height: '48',
  logo_footer_link: '/',
  favicon_url: '',

  // Contact & Socials
  contact_email: '',
  contact_phone: '',
  contact_emergency: '',
  social_facebook: '',
  social_twitter: '',
  social_linkedin: '',
  social_instagram: '',
  social_youtube: '',

  // Areas - Initialize all settings
  ...initializeAreaSettings()
})

function initializeAreaSettings() {
  const areaSettings = {}
  const areaNames = ['news', 'systems', 'docs', 'stats', 'tutorials', 'contact']
  
  areaNames.forEach(name => {
    const prefix = `section_${name}`
    areaSettings[`${prefix}_id`] = ''
    areaSettings[`${prefix}_title`] = ''
    areaSettings[`${prefix}_subtitle`] = ''
    areaSettings[`${prefix}_title_color`] = '#2d3748'
    areaSettings[`${prefix}_bg_type`] = 'solid'
    areaSettings[`${prefix}_bg_color`] = '#ffffff'
    areaSettings[`${prefix}_gradient_type`] = 'linear'
    areaSettings[`${prefix}_gradient_direction`] = 'to bottom'
    areaSettings[`${prefix}_gradient_color1`] = '#667eea'
    areaSettings[`${prefix}_gradient_color2`] = '#764ba2'
    areaSettings[`${prefix}_bg_image`] = ''
    areaSettings[`${prefix}_bg_size`] = 'cover'
    areaSettings[`${prefix}_bg_overlay`] = '#000000'
    areaSettings[`${prefix}_bg_overlay_opacity`] = 50
    areaSettings[`${prefix}_is_active`] = 'true'
  })
  
  return areaSettings
}

const areas = [
  { id: 'news', name: 'Noticias', prefix: 'section_news', icon: 'article' },
  { id: 'systems', name: 'Sistemas', prefix: 'section_systems', icon: 'computer' },
  { id: 'docs', name: 'Documentos', prefix: 'section_docs', icon: 'folder' },
  { id: 'stats', name: 'Estadísticas', prefix: 'section_stats', icon: 'bar_chart' },
  { id: 'tutorials', name: 'Material educativo', prefix: 'section_tutorials', icon: 'school' },
  { id: 'contact', name: 'Contacto', prefix: 'section_contact', icon: 'contact_mail' }
]

function getGradientPreviewStyle(prefix) {
  const type = settings.value[`${prefix}_gradient_type`]
  const color1 = settings.value[`${prefix}_gradient_color1`]
  const color2 = settings.value[`${prefix}_gradient_color2`]
  const direction = settings.value[`${prefix}_gradient_direction`]
  
  if (type === 'linear') {
    return {
      background: `linear-gradient(${direction}, ${color1}, ${color2})`
    }
  } else {
    return {
      background: `radial-gradient(circle, ${color1}, ${color2})`
    }
  }
}

function getImagePreviewStyle(prefix) {
  const imageUrl = settings.value[`${prefix}_bg_image`]
  const size = settings.value[`${prefix}_bg_size`]
  const overlay = settings.value[`${prefix}_bg_overlay`]
  const opacity = settings.value[`${prefix}_bg_overlay_opacity`] / 100
  
  let backgroundImage = `url(${imageUrl})`
  if (overlay && opacity > 0) {
    const overlayRgba = hexToRgba(overlay, opacity)
    backgroundImage = `linear-gradient(${overlayRgba}, ${overlayRgba}), url(${imageUrl})`
  }
  
  return {
    backgroundImage,
    backgroundSize: size === 'repeat' ? 'auto' : size,
    backgroundRepeat: size === 'repeat' ? 'repeat' : 'no-repeat',
    backgroundPosition: 'center'
  }
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function openMediaSelector(field) {
  currentMediaField.value = field
  mediaSelectorOpen.value = true
}

function handleMediaSelect(url) {
  if (currentMediaField.value) {
    settings.value[currentMediaField.value] = url
  }
}

async function applyFavicon() {
  if (!settings.value.favicon_url) {
    $q.notify({
      color: 'warning',
      message: 'Por favor selecciona un favicon primero',
      icon: 'warning'
    })
    return
  }

  applyingFavicon.value = true
  try {
    await api.post('/settings/update-favicon', {
      faviconUrl: settings.value.favicon_url
    })
    
    $q.notify({
      color: 'positive',
      message: 'Favicon aplicado exitosamente. Recarga la página para verlo.',
      icon: 'check_circle',
      timeout: 5000
    })
  } catch (error) {
    console.error('Error applying favicon:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al aplicar el favicon: ' + (error.response?.data?.error || error.message),
      icon: 'error'
    })
  } finally {
    applyingFavicon.value = false
  }
}

async function loadSettings() {
  try {
    const response = await api.get('/settings')
    // Merge response with defaults
    settings.value = { ...settings.value, ...response.data }
  } catch (error) {
    console.error('Error loading settings:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar la configuración',
      icon: 'error'
    })
  }
}

async function saveSettings() {
  saving.value = true
  try {
    await api.put('/settings', settings.value)
    $q.notify({
      color: 'positive',
      message: 'Configuración guardada exitosamente',
      icon: 'check_circle'
    })
  } catch (error) {
    console.error('Error saving settings:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al guardar los cambios',
      icon: 'error'
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.my-card {
  border-radius: 12px;
}

.section-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.section-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.section-inactive {
  opacity: 0.7;
}

.section-inactive .q-card__section {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%) !important;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-option-container {
  animation: fadeIn 0.3s ease;
}

.gradient-preview,
.image-preview {
  height: 100px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
