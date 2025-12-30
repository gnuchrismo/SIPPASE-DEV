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
  <q-page class="seo-settings-page">
    <!-- Header con título y acciones -->
    <div class="page-header q-pa-md">
      <div class="row items-center justify-between">
        <div>
          <div class="text-h4 text-weight-bold text-primary">
            <q-icon name="search" class="q-mr-sm" />
            SEO & Sitemap
          </div>
          <div class="text-subtitle2 text-grey-7 q-mt-xs">
            Optimiza la visibilidad de tu sitio y monitorea el tráfico
          </div>
        </div>
        <div>
          <q-btn
            label="Guardar Cambios"
            color="primary"
            icon="save"
            :loading="saving"
            @click="saveSettings"
            unelevated
            no-caps
            class="q-px-lg"
          />
        </div>
      </div>
      
      <!-- Tabs de navegación -->
      <q-tabs
        v-model="activeTab"
        class="text-grey-7 q-mt-md"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="general" icon="settings" label="General" no-caps />
        <q-tab name="robots" icon="smart_toy" label="Robots.txt" no-caps />
        <q-tab name="sitemap" icon="account_tree" label="Sitemap" no-caps />
        <q-tab name="social" icon="share" label="Social Media" no-caps />
        <q-tab name="analytics" icon="analytics" label="Analíticas" no-caps />
      </q-tabs>
    </div>

    <q-separator />

    <!-- Loading state -->
    <div v-if="loading" class="row justify-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Tab Panels -->
    <q-tab-panels v-else v-model="activeTab" animated transition-prev="slide-down" transition-next="slide-up">
      
      <!-- ========================================== -->
      <!-- PANEL: CONFIGURACIÓN GENERAL SEO -->
      <!-- ========================================== -->
      <q-tab-panel name="general" class="q-pa-md">
        <div class="row q-col-gutter-lg">
          <!-- Columna principal: Formularios -->
          <div class="col-12 col-md-8">
            <!-- Card: Meta Tags -->
            <q-card flat bordered class="q-mb-md modern-card">
              <q-card-section>
                <div class="text-h6 text-weight-medium">
                  <q-icon name="label" color="primary" class="q-mr-sm" />
                  Meta Tags Principales
                </div>
                <div class="text-caption text-grey-7 q-mt-xs">
                  Define los meta tags que aparecerán en los motores de búsqueda
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section class="q-gutter-md">
                <!-- Título por defecto -->
                <div>
                  <q-input
                    v-model="settings.seo_title_default"
                    label="Título por Defecto *"
                    hint="Se usa cuando una página no tiene título específico"
                    outlined
                    counter
                    maxlength="60"
                    :rules="[
                      val => !!val || 'El título es requerido',
                      val => val.length >= 30 || 'Se recomienda al menos 30 caracteres',
                      val => val.length <= 60 || 'No debe exceder 60 caracteres'
                    ]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="title" color="grey-6" />
                    </template>
                    <template v-slot:append>
                      <q-icon name="help_outline" class="cursor-pointer text-grey-6">
                        <q-tooltip max-width="300px">
                          El título es uno de los elementos SEO más importantes. 
                          Debe contener palabras clave relevantes y tener entre 50-60 caracteres.
                        </q-tooltip>
                      </q-icon>
                    </template>
                    <template v-slot:after>
                      <q-linear-progress
                        :value="(settings.seo_title_default?.length || 0) / 60"
                        :color="getTitleColor(settings.seo_title_default?.length || 0)"
                        class="q-mt-xs"
                        size="4px"
                      />
                    </template>
                  </q-input>
                </div>

                <!-- Plantilla de título -->
                <div>
                  <q-input
                    v-model="settings.seo_title_template"
                    label="Plantilla de Título"
                    hint="Ejemplo: %s | SIPPASE (donde %s será reemplazado por el título de la página)"
                    outlined
                  >
                    <template v-slot:prepend>
                      <q-icon name="format_size" color="grey-6" />
                    </template>
                  </q-input>
                </div>

                <!-- Descripción por defecto -->
                <div>
                  <q-input
                    v-model="settings.seo_description_default"
                    label="Descripción por Defecto *"
                    type="textarea"
                    rows="3"
                    hint="Meta descripción que aparecerá en los resultados de búsqueda"
                    outlined
                    counter
                    maxlength="160"
                    :rules="[
                      val => !!val || 'La descripción es requerida',
                      val => val.length >= 120 || 'Se recomienda al menos 120 caracteres',
                      val => val.length <= 160 || 'No debe exceder 160 caracteres'
                    ]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="description" color="grey-6" />
                    </template>
                    <template v-slot:append>
                      <q-icon name="help_outline" class="cursor-pointer text-grey-6">
                        <q-tooltip max-width="300px">
                          La descripción debe ser atractiva y descriptiva, 
                          con 150-160 caracteres para óptima visualización.
                        </q-tooltip>
                      </q-icon>
                    </template>
                    <template v-slot:after>
                      <q-linear-progress
                        :value="(settings.seo_description_default?.length || 0) / 160"
                        :color="getDescriptionColor(settings.seo_description_default?.length || 0)"
                        class="q-mt-xs"
                        size="4px"
                      />
                    </template>
                  </q-input>
                </div>

                <!-- Keywords -->
                <div>
                  <q-input
                    v-model="settings.seo_keywords_default"
                    label="Palabras Clave (Keywords)"
                    hint="Separadas por comas. Ejemplo: justicia, transparencia, gobierno digital"
                    outlined
                  >
                    <template v-slot:prepend>
                      <q-icon name="local_offer" color="grey-6" />
                    </template>
                    <template v-slot:append>
                      <q-badge v-if="keywordCount > 0" color="primary" :label="keywordCount + ' palabras'" />
                    </template>
                  </q-input>
                </div>
              </q-card-section>
            </q-card>

            <!-- Card: SEO Score -->
            <q-card flat bordered class="modern-card">
              <q-card-section>
                <div class="text-h6 text-weight-medium">
                  <q-icon name="verified" color="positive" class="q-mr-sm" />
                  Puntuación SEO
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="row items-center q-col-gutter-md">
                  <div class="col-12 col-sm-4 text-center">
                    <q-circular-progress
                      :value="seoScore"
                      size="120px"
                      :thickness="0.15"
                      :color="getSeoScoreColor(seoScore)"
                      track-color="grey-3"
                      class="q-ma-md"
                      show-value
                    >
                      <div class="text-h5 text-weight-bold">{{ seoScore }}</div>
                    </q-circular-progress>
                    <div class="text-caption text-grey-7">Puntuación General</div>
                  </div>
                  <div class="col-12 col-sm-8">
                    <q-list dense>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon :name="checks.title ? 'check_circle' : 'cancel'" 
                                  :color="checks.title ? 'positive' : 'negative'" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Título optimizado</q-item-label>
                          <q-item-label caption>{{ checks.titleMsg }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      
                      <q-item>
                        <q-item-section avatar>
                          <q-icon :name="checks.description ? 'check_circle' : 'cancel'" 
                                  :color="checks.description ? 'positive' : 'negative'" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Descripción optimizada</q-item-label>
                          <q-item-label caption>{{ checks.descriptionMsg }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      
                      <q-item>
                        <q-item-section avatar>
                          <q-icon :name="checks.keywords ? 'check_circle' : 'cancel'" 
                                  :color="checks.keywords ? 'positive' : 'negative'" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Palabras clave definidas</q-item-label>
                          <q-item-label caption>{{ checks.keywordsMsg }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section avatar>
                          <q-icon :name="checks.ogImage ? 'check_circle' : 'cancel'" 
                                  :color="checks.ogImage ? 'positive' : 'negative'" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Imagen social configurada</q-item-label>
                          <q-item-label caption>{{ checks.ogImageMsg }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Columna sidebar: Previews -->
          <div class="col-12 col-md-4">
            <!-- Vista previa Google Desktop -->
            <q-card flat bordered class="q-mb-md modern-card">
              <q-card-section>
                <div class="text-subtitle1 text-weight-medium">
                  <q-icon name="desktop_windows" class="q-mr-xs" />
                  Vista Previa Google
                </div>
                <div class="text-caption text-grey-7">Desktop</div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="google-preview">
                  <div class="preview-url">{{ siteUrl }}</div>
                  <div class="preview-title">
                    {{ previewTitle }}
                  </div>
                  <div class="preview-desc">
                    {{ previewDescription }}
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Vista previa Google Mobile -->
            <q-card flat bordered class="modern-card">
              <q-card-section>
                <div class="text-subtitle1 text-weight-medium">
                  <q-icon name="smartphone" class="q-mr-xs" />
                  Vista Previa Google
                </div>
                <div class="text-caption text-grey-7">Mobile</div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="google-preview-mobile">
                  <div class="preview-url-mobile">{{ siteUrl }}</div>
                  <div class="preview-title-mobile">
                    {{ previewTitle }}
                  </div>
                  <div class="preview-desc-mobile">
                    {{ previewDescription }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- ========================================== -->
      <!-- PANEL: ROBOTS.TXT -->
      <!-- ========================================== -->
      <q-tab-panel name="robots" class="q-pa-md">
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-8">
            <q-card flat bordered class="modern-card">
              <q-card-section>
                <div class="text-h6 text-weight-medium">
                  <q-icon name="smart_toy" color="primary" class="q-mr-sm" />
                  Configuración de Robots.txt
                </div>
                <div class="text-caption text-grey-7 q-mt-xs">
                  Define las reglas de acceso para los motores de búsqueda
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <q-input
                  v-model="settings.seo_robots_txt"
                  type="textarea"
                  rows="12"
                  outlined
                  bg-color="grey-1"
                  class="font-mono"
                  hint="Ejemplo: User-agent: * / Disallow: /admin/"
                />
                
                <div class="q-mt-md">
                  <q-btn
                    :href="getResourceUrl('robots.txt')"
                    target="_blank"
                    label="Ver Robots.txt Actual"
                    icon="open_in_new"
                    flat
                    color="primary"
                    no-caps
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card flat bordered class="modern-card">
              <q-card-section>
                <div class="text-subtitle1 text-weight-medium">
                  <q-icon name="info" color="info" class="q-mr-xs" />
                  Guía Rápida
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="text-caption q-mb-md">
                  <strong>User-agent: *</strong><br/>
                  Aplicar a todos los robots
                </div>
                
                <div class="text-caption q-mb-md">
                  <strong>Disallow: /admin/</strong><br/>
                  Bloquear acceso a directorios específicos
                </div>
                
                <div class="text-caption q-mb-md">
                  <strong>Allow: /public/</strong><br/>
                  Permitir acceso explícito
                </div>
                
                <div class="text-caption">
                  <strong>Sitemap:</strong><br/>
                  {{ siteUrl }}/sitemap.xml
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- ========================================== -->
      <!-- PANEL: SITEMAP -->
      <!-- ========================================== -->
      <q-tab-panel name="sitemap" class="q-pa-md">
        <div class="row q-col-gutter-lg">
          <div class="col-12">
            <q-card flat bordered class="modern-card">
              <q-card-section>
                <div class="row items-center justify-between">
                  <div>
                    <div class="text-h6 text-weight-medium">
                      <q-icon name="account_tree" color="primary" class="q-mr-sm" />
                      Sitemap XML
                    </div>
                    <div class="text-caption text-grey-7 q-mt-xs">
                      Mapa del sitio generado automáticamente
                    </div>
                  </div>
                  <div>
                    <q-btn
                      :href="getResourceUrl('sitemap.xml')"
                      target="_blank"
                      label="Ver Sitemap.xml"
                      icon="open_in_new"
                      color="primary"
                      unelevated
                      no-caps
                    />
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6 col-md-4">
                    <q-card flat bordered>
                      <q-card-section class="text-center">
                        <q-icon name="link" size="2em" color="primary" />
                        <div class="text-h6 q-mt-sm">{{ sitemapInfo.totalUrls || '-' }}</div>
                        <div class="text-caption text-grey-7">URLs Totales</div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-sm-6 col-md-4">
                    <q-card flat bordered>
                      <q-card-section class="text-center">
                        <q-icon name="article" size="2em" color="positive" />
                        <div class="text-h6 q-mt-sm">{{ sitemapInfo.blogPosts || '-' }}</div>
                        <div class="text-caption text-grey-7">Posts de Blog</div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-sm-6 col-md-4">
                    <q-card flat bordered>
                      <q-card-section class="text-center">
                        <q-icon name="description" size="2em" color="info" />
                        <div class="text-h6 q-mt-sm">{{ sitemapInfo.staticPages || '-' }}</div>
                        <div class="text-caption text-grey-7">Páginas Estáticas</div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <q-separator class="q-my-lg" />

                <div>
                  <div class="text-subtitle1 text-weight-medium q-mb-md">
                    Instrucciones de Envío
                  </div>
                  <q-list bordered separator>
                    <q-item>
                      <q-item-section avatar>
                        <q-avatar color="primary" text-color="white" icon="search" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Google Search Console</q-item-label>
                        <q-item-label caption>https://search.google.com/search-console</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn
                          href="https://search.google.com/search-console"
                          target="_blank"
                          label="Ir"
                          flat
                          dense
                          color="primary"
                          icon-right="open_in_new"
                        />
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section avatar>
                        <q-avatar color="info" text-color="white" icon="explore" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Bing Webmaster Tools</q-item-label>
                        <q-item-label caption>https://www.bing.com/webmasters</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn
                          href="https://www.bing.com/webmasters"
                          target="_blank"
                          label="Ir"
                          flat
                          dense
                          color="info"
                          icon-right="open_in_new"
                        />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- ========================================== -->
      <!-- PANEL: SOCIAL MEDIA / OPEN GRAPH -->
      <!-- ========================================================================================== -->
      <q-tab-panel name="social" class="q-pa-md">
        <div class="row q-col-gutter-lg">
          <!-- Configuración de imagen -->
          <div class="col-12 col-md-8">
            <q-card flat bordered class="modern-card q-mb-md">
              <q-card-section>
                <div class="text-h6 text-weight-medium">
                  <q-icon name="image" color="primary" class="q-mr-sm" />
                  Imagen Social (Open Graph)
                </div>
                <div class="text-caption text-grey-7 q-mt-xs">
                  Imagen que se muestra al compartir en redes sociales
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Preview de imagen -->
                  <div class="col-12 col-md-6">
                    <q-img
                      :src="settings.seo_og_image || '/placeholder-image.png'"
                      style="height: 250px; border-radius: 8px;"
                      fit="cover"
                      class="bg-grey-2"
                    >
                      <template v-slot:error>
                        <div class="absolute-full flex flex-center bg-grey-3">
                          <div class="text-center">
                            <q-icon name="image" size="50px" color="grey-6" />
                            <div class="text-caption text-grey-6 q-mt-sm">Sin imagen</div>
                          </div>
                        </div>
                      </template>
                    </q-img>
                    
                    <div class="q-mt-md text-center">
                      <q-btn
                        label="Seleccionar desde Biblioteca"
                        icon="photo_library"
                        color="primary"
                        outline
                        @click="showMediaSelector = true"
                        no-caps
                      />
                    </div>
                  </div>

                  <!-- Información y recomendaciones -->
                  <div class="col-12 col-md-6">
                    <div class="text-subtitle2 text-weight-medium q-mb-sm">Recomendaciones</div>
                    
                    <q-list dense>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="aspect_ratio" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>Dimensiones óptimas</q-item-label>
                          <q-item-label>1200 x 630 píxeles</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="storage" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>Tamaño máximo</q-item-label>
                          <q-item-label>Máximo 1 MB</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="image" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>Formato</q-item-label>
                          <q-item-label>JPG, PNG o WebP</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="palette" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>Relación de aspecto</q-item-label>
                          <q-item-label>1.91:1 (recomendado)</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Previews de redes sociales -->
          <div class="col-12 col-md-4">
            <!-- Facebook Preview -->
            <q-card flat bordered class="modern-card q-mb-md">
              <q-card-section>
                <div class="text-subtitle1 text-weight-medium">
                  <q-icon name="facebook" color="blue-7" />
                  Facebook
                </div>
              </q-card-section>
              <q-separator />
              <q-card-section class="q-pa-none">
                <q-img
                  :src="settings.seo_og_image || '/placeholder-image.png'"
                  style="height: 150px;"
                  fit="cover"
                />
                <div class="q-pa-sm bg-grey-2">
                  <div class="text-caption text-grey-7 text-uppercase">{{ siteUrl }}</div>
                  <div class="text-body2 text-weight-medium ellipsis">{{ previewTitle }}</div>
                  <div class="text-caption text-grey-7 ellipsis-2-lines">{{ previewDescription }}</div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Twitter/X Preview -->
            <q-card flat bordered class="modern-card">
              <q-card-section>
                <div class="text-subtitle1 text-weight-medium">
                  <q-icon name="X" />
                  Twitter / X
                </div>
              </q-card-section>
              <q-separator />
              <q-card-section class="q-pa-none">
                <q-img
                  :src="settings.seo_og_image || '/placeholder-image.png'"
                  style="height: 150px;"
                  fit="cover"
                />
                <div class="q-pa-sm bg-grey-1">
                  <div class="text-body2 text-weight-medium ellipsis">{{ previewTitle }}</div>
                  <div class="text-caption text-grey-7 ellipsis">{{ previewDescription }}</div>
                  <div class="text-caption text-grey-6 q-mt-xs">{{ siteUrl }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- ========================================== -->
      <!-- PANEL: ANALÍTICAS -->
      <!-- ========================================== -->
      <q-tab-panel name="analytics" class="q-pa-md">
        <AnalyticsDashboard />
      </q-tab-panel>
    </q-tab-panels>

    <!-- Media Selector Dialog -->
    <q-dialog v-model="showMediaSelector">
      <MediaSelector v-model="showMediaSelector" @select="onImageSelected" />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '../../boot/axios';
import { getResourceUrl } from '../../utils/urlHelper';
import { useQuasar } from 'quasar';
import MediaSelector from '../../components/admin/MediaSelector.vue';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard.vue';

const $q = useQuasar();
const loading = ref(true);
const saving = ref(false);
const showMediaSelector = ref(false);
const activeTab = ref('general');

const settings = ref({
  seo_title_default: '',
  seo_title_template: '',
  seo_description_default: '',
  seo_keywords_default: '',
  seo_og_image: '',
  seo_robots_txt: ''
});

const sitemapInfo = ref({
  totalUrls: 0,
  blogPosts: 0,
  staticPages: 0
});

const siteUrl = computed(() => {
  return window.location.origin.replace('5173', '3000').replace(':9000', '');
});

// ========================================
// COMPUTED PROPERTIES 
// ========================================

const keywordCount = computed(() => {
  if (!settings.value.seo_keywords_default) return 0;
  return settings.value.seo_keywords_default.split(',').filter(k => k.trim()).length;
});

const previewTitle = computed(() => {
  return settings.value.seo_title_default || 'Título de la Página';
});

const previewDescription = computed(() => {
  return settings.value.seo_description_default || 
    'Esta es la descripción que aparecerá en los resultados de búsqueda y cuando se comparta en redes sociales...';
});

// SEO Score calculation
const checks = computed(() => {
  const titleLen = settings.value.seo_title_default?.length || 0;
  const descLen = settings.value.seo_description_default?.length || 0;
  const hasKeywords = keywordCount.value > 0;
  const hasOgImage = !!settings.value.seo_og_image;

  return {
    title: titleLen >= 30 && titleLen <= 60,
    titleMsg: titleLen >= 30 && titleLen <= 60 
      ? `Perfecto: ${titleLen} caracteres`
      : titleLen === 0 
      ? 'Falta título'
      : titleLen < 30 
      ? 'Muy corto, agrega más contenido'
      : 'Muy largo, reduce caracteres',
    
    description: descLen >= 120 && descLen <= 160,
    descriptionMsg: descLen >= 120 && descLen <= 160
      ? `Perfecto: ${descLen} caracteres`
      : descLen === 0
      ? 'Falta descripción'
      : descLen < 120
      ? 'Muy corta, agrega más contenido'
      : 'Muy larga, reduce caracteres',
    
    keywords: hasKeywords,
    keywordsMsg: hasKeywords
      ? `${keywordCount.value} palabras clave definidas`
      : 'Agrega palabras clave relevantes',
    
    ogImage: hasOgImage,
    ogImageMsg: hasOgImage
      ? 'Imagen configurada correctamente'
      : 'Selecciona una imagen para redes sociales'
  };
});

const seoScore = computed(() => {
  let score = 0;
  if (checks.value.title) score += 30;
  if (checks.value.description) score += 30;
  if (checks.value.keywords) score += 20;
  if (checks.value.ogImage) score += 20;
  return score;
});

// ========================================
// HELPER METHODS
// ========================================

const getTitleColor = (length) => {
  if (length === 0) return 'grey';
  if (length < 30) return 'warning';
  if (length >= 30 && length <= 60) return 'positive';
  return 'negative';
};

const getDescriptionColor = (length) => {
  if (length === 0) return 'grey';
  if (length < 120) return 'warning';
  if (length >= 120 && length <= 160) return 'positive';
  return 'negative';
};

const getSeoScoreColor = (score) => {
  if (score >= 80) return 'positive';
  if (score >= 50) return 'warning';
  return 'negative';
};

// ========================================
// DATA LOADING
// ========================================

const loadSettings = async () => {
  loading.value = true;
  try {
    const response = await api.get('/seo/settings');
    settings.value = response.data;
  } catch (error) {
    console.error('Error loading SEO settings:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la configuración SEO'
    });
  } finally {
    loading.value = false;
  }
};

const loadSitemapInfo = async () => {
  try {
    // Esto es un placeholder - en producción podrías tener un endpoint específico
    sitemapInfo.value = {
      totalUrls: 15,
      blogPosts: 8,
      staticPages: 7
    };
  } catch (error) {
    console.error('Error loading sitemap info:', error);
  }
};

const saveSettings = async () => {
  saving.value = true;
  try {
    await api.put('/seo/settings', settings.value);
    $q.notify({
      type: 'positive',
      message: 'Configuración guardada exitosamente',
      icon: 'check_circle'
    });
  } catch (error) {
    console.error('Error saving SEO settings:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al guardar la configuración'
    });
  } finally {
    saving.value = false;
  }
};

const onImageSelected = (imageUrl) => {
  settings.value.seo_og_image = imageUrl;
  showMediaSelector.value = false;
  
  $q.notify({
    type: 'positive',
    message: 'Imagen seleccionada correctamente',
    icon: 'image'
  });
};

// ========================================
// LIFECYCLE
// ========================================

onMounted(() => {
  loadSettings();
  loadSitemapInfo();
});
</script>

<style scoped>
.seo-settings-page {
  background: #f5f5f5;
}

.page-header {
  background: white;
}

.modern-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.modern-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.font-mono {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
}

/* Google Preview Styles */
.google-preview {
  font-family: Arial, sans-serif;
  padding: 12px;
  background: white;
  border: 1px solid #dfe1e5;
  border-radius: 8px;
}

.preview-url {
  color: #202124;
  font-size: 14px;
  line-height: 1.3;
  margin-bottom: 4px;
}

.preview-title {
  color: #1a0dab;
  font-size: 20px;
  line-height: 1.3;
  cursor: pointer;
  margin-bottom: 4px;
  font-weight: 400;
}

.preview-title:hover {
  text-decoration: underline;
}

.preview-desc {
  color: #4d5156;
  font-size: 14px;
  line-height: 1.58;
}

/* Google Mobile Preview */
.google-preview-mobile {
  font-family: Arial, sans-serif;
  padding: 10px;
  background: white;
  border: 1px solid #dfe1e5;
  border-radius: 8px;
}

.preview-url-mobile {
  color: #202124;
  font-size: 12px;
  line-height: 1.3;
  margin-bottom: 2px;
}

.preview-title-mobile {
  color: #1a0dab;
  font-size: 16px;
  line-height: 1.3;
  cursor: pointer;
  margin-bottom: 2px;
  font-weight: 400;
}

.preview-desc-mobile {
  color: #4d5156;
  font-size: 13px;
  line-height: 1.5;
}

/* Animations */
.q-tab-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-header {
    padding: 12px !important;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>
