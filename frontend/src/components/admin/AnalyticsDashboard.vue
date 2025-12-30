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
  <div class="analytics-dashboard">
    <!-- Period Selector -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-medium">
          <q-icon name="analytics" color="primary" class="q-mr-sm" />
          Analíticas del Sitio
        </div>
        <div class="text-caption text-grey-7">
          Estadísticas de visitantes y comportamiento
        </div>
      </div>
      <div>
        <q-btn-toggle
          v-model="selectedPeriod"
          toggle-color="primary"
          :options="periodOptions"
          @update:model-value="loadAnalytics"
          unelevated
          no-caps
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="row justify-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Analytics Content -->
    <div v-else>
      <!-- Summary Cards -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="analytics-card">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-h5 text-weight-bold text-primary">
                    {{ formatNumber(stats.summary?.total_visits) }}
                  </div>
                  <div class="text-caption text-grey-7 q-mt-xs">Visitas Totales</div>
                </div>
                <div>
                  <q-icon name="visibility" size="2.5em" color="primary" class="q-ml-md" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="analytics-card">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-h5 text-weight-bold text-positive">
                    {{ formatNumber(stats.summary?.unique_visitors) }}
                  </div>
                  <div class="text-caption text-grey-7 q-mt-xs">Visitantes Únicos</div>
                </div>
                <div>
                  <q-icon name="people" size="2.5em" color="positive" class="q-ml-md" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="analytics-card">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-h5 text-weight-bold text-info">
                    {{ formatNumber(stats.summary?.unique_pages) }}
                  </div>
                  <div class="text-caption text-grey-7 q-mt-xs">Páginas Únicas</div>
                </div>
                <div>
                  <q-icon name="article" size="2.5em" color="info" class="q-ml-md" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="analytics-card">
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-h5 text-weight-bold text-warning">
                    {{ formatNumber(stats.summary?.active_days) }}
                  </div>
                  <div class="text-caption text-grey-7 q-mt-xs">Días Activos</div>
                </div>
                <div>
                  <q-icon name="event" size="2.5em" color="warning" class="q-ml-md" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Charts and Details Row -->
      <div class="row q-col-gutter-md">
        <!-- Visitor Trends Chart -->
        <div class="col-12 col-md-8">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium">
                <q-icon name="trending_up" color="primary" />
                Tendencia de Visitas
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div v-if="stats.trends && stats.trends.length > 0" class="trends-chart">
                <!-- Simple bar chart visualization -->
                <div class="row items-end q-gutter-sm" style="height: 200px;">
                  <div 
                    v-for="(trend, index) in stats.trends" 
                    :key="index"
                    class="col chart-bar"
                    style="flex: 1;"
                  >
                    <q-tooltip>
                      {{ formatDate(trend.date) }}<br/>
                      Visitas: {{ trend.visits }}<br/>
                      Visitantes: {{ trend.unique_visitors }}
                    </q-tooltip>
                    <div 
                      class="bar bg-primary" 
                      :style="{ height: getBarHeight(trend.visits) + '%' }"
                    ></div>
                    <div class="text-caption text-center q-mt-xs text-grey-7">
                      {{ formatShortDate(trend.date) }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-grey-7 q-pa-xl">
                <q-icon name="show_chart" size="3em" />
                <div class="q-mt-sm">No hay datos para este período</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Device Breakdown -->
        <div class="col-12 col-md-4">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium">
                <q-icon name="devices" color="primary" />
                Dispositivos
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div v-if="stats.devices && stats.devices.length > 0">
                <div v-for="device in stats.devices" :key="device.device_type" class="q-mb-md">
                  <div class="row items-center justify-between q-mb-xs">
                    <span class="text-capitalize">{{ getDeviceLabel(device.device_type) }}</span>
                    <span class="text-weight-bold">{{ device.percentage }}%</span>
                  </div>
                  <q-linear-progress 
                    :value="device.percentage / 100" 
                    :color="getDeviceColor(device.device_type)"
                    size="8px"
                    rounded
                  />
                </div>
              </div>
              <div v-else class="text-center text-grey-7 q-pa-md">
                Sin datos de dispositivos
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Top Pages -->
        <div class="col-12 col-md-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium">
                <q-icon name="description" color="primary" />
                Páginas Más Visitadas
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-none">
              <q-list v-if="stats.topPages && stats.topPages.length > 0" separator>
                <q-item v-for="(page, index) in stats.topPages.slice(0, 10)" :key="index">
                  <q-item-section avatar>
                    <q-avatar :color="index < 3 ? 'primary' : 'grey-5'" text-color="white" size="sm">
                      {{ index + 1 }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-body2">{{ page.url }}</q-item-label>
                    <q-item-label caption>{{ page.page_title || 'Sin título' }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div>
                      <div class="text-weight-bold">{{ formatNumber(page.views) }}</div>
                      <div class="text-caption text-grey-7">vistas</div>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="text-center text-grey-7 q-pa-xl">
                <q-icon name="article" size="2em" />
                <div class="q-mt-sm">Sin datos de páginas</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Top Browsers & Countries -->
        <div class="col-12 col-md-6">
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium">
                <q-icon name="language" color="primary" />
                Navegadores Principales
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div v-if="stats.browsers && stats.browsers.length > 0">
                <div v-for="browser in stats.browsers.slice(0, 5)" :key="browser.browser" class="q-mb-sm">
                  <div class="row items-center justify-between">
                    <span>{{ browser.browser }}</span>
                    <q-badge :label="formatNumber(browser.count)" color="primary" />
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-grey-7 q-pa-md">
                Sin datos de navegadores
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium">
                <q-icon name="public" color="primary" />
                Países
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div v-if="stats.countries && stats.countries.length > 0">
                <div v-for="country in stats.countries.slice(0, 5)" :key="country.country" class="q-mb-sm">
                  <div class="row items-center justify-between">
                    <span>{{ getCountryName(country.country) }}</span>
                    <q-badge :label="formatNumber(country.count)" color="info" />
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-grey-7 q-pa-md">
                Sin datos de países
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAnalytics } from '../../composables/useAnalytics';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const { getStatistics } = useAnalytics();

const loading = ref(true);
const selectedPeriod = ref('7d');

const periodOptions = [
  { label: 'Hoy', value: '1d' },
  { label: '7 Días', value: '7d' },
  { label: '30 Días', value: '30d' },
  { label: '90 Días', value: '90d' }
];

const stats = ref({
  summary: {},
  trends: [],
  topPages: [],
  devices: [],
  browsers: [],
  countries: [],
  referrers: []
});

const loadAnalytics = async () => {
  loading.value = true;
  try {
    const data = await getStatistics(selectedPeriod.value);
    stats.value = data;
  } catch (error) {
    console.error('Error loading analytics:', error);
    $q.notify({
      type: 'warning',
      message: 'No se pudieron cargar las analíticas. Asegúrate de haber ejecutado el schema de analytics en la base de datos.',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

// Helper methods
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return new Intl.NumberFormat('es-BO').format(num);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-BO', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const formatShortDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-BO', { 
    month: 'short', 
    day: 'numeric' 
  });
};

const maxVisits = computed(() => {
  if (!stats.value.trends || stats.value.trends.length === 0) return 1;
  return Math.max(...stats.value.trends.map(t => t.visits));
});

const getBarHeight = (visits) => {
  if (maxVisits.value === 0) return 0;
  return Math.max((visits / maxVisits.value) * 100, 5); // Minimum 5% for visibility
};

const getDeviceLabel = (deviceType) => {
  const labels = {
    desktop: 'Escritorio',
    mobile: 'Móvil',
    tablet: 'Tablet'
  };
  return labels[deviceType] || deviceType;
};

const getDeviceColor = (deviceType) => {
  const colors = {
    desktop: 'primary',
    mobile: 'positive',
    tablet: 'info'
  };
  return colors[deviceType] || 'grey';
};

const getCountryName = (code) => {
  const countries = {
    BO: 'Bolivia',
    US: 'Estados Unidos',
    BR: 'Brasil',
    AR: 'Argentina',
    PE: 'Perú',
    CL: 'Chile',
    CO: 'Colombia',
    EC: 'Ecuador',
    ES: 'España',
    MX: 'México'
  };
  return countries[code] || code;
};

onMounted(() => {
  loadAnalytics();
});
</script>

<style scoped>
.analytics-dashboard {
  min-height: 400px;
}

.analytics-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.analytics-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.trends-chart {
  padding: 16px;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-width: 20px;
}

.bar {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  min-height: 5px;
}

.chart-bar:hover .bar {
  opacity: 0.8;
  transform: scaleY(1.05);
}
</style>
