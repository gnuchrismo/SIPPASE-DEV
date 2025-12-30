<template>
  <section 
    :id="sectionId" 
    class="section tutorials-section font-inter"
    :style="sectionStyle"
  >
    <div class="wrap q-px-lg">
      <div class="row items-end justify-between q-mb-xl header-row">
        <div class="col-12 col-md-8">
          <div class="text-overline text-primary text-weight-bold q-mb-sm">EDUCACIÓN CONTINUA</div>
          <h2 :style="{ color: titleColor }" class="text-h3 text-weight-bolder q-mb-sm section-title">
            {{ title || 'Tutoriales y Material Educativo' }}
          </h2>
          <p class="text-subtitle1 text-grey-7" style="max-width: 600px; line-height: 1.6;">
            {{ subtitle || 'Plataforma de aprendizaje diseñada para fortalecer tus capacidades. Accede a cursos gratuitos y material especializado.' }}
          </p>
        </div>
        <div class="col-12 col-md-4 text-right gt-sm">
             <div class="q-gutter-md">
                 <q-btn v-if="!authStore.token" outline color="primary" label="Registrarse Gratis" rounded no-caps icon="person_add" @click="showAuthModal = true" />
                 <q-btn flat no-caps color="primary" label="Ver todos los cursos" icon-right="arrow_forward" to="/tutorials" />
             </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="row q-col-gutter-lg">
        <div v-for="n in 4" :key="n" class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-card flat class="rounded-borders-xl bg-white shadow-1">
            <q-skeleton height="200px" class="rounded-borders-top-xl" />
            <q-card-section>
              <q-skeleton type="text" class="text-h6" width="80%" />
              <q-skeleton type="text" class="text-caption q-mt-sm" />
              <div class="row justify-between q-mt-md">
                 <q-skeleton type="QBtn" width="80px" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Content Grid -->
      <div v-else class="row q-col-gutter-lg items-stretch">
        
        <!-- Feature/CTA Card (First item if not logged in options?) or just part of grid -->
        <!-- Let's put a "Premium Access" card as the first item or last item to encourage sign up -->
        
        <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="tutorial in tutorials.slice(0, 7)" :key="tutorial.id">
          <q-card class="tutorial-card full-height column no-wrap" @click="$router.push(`/tutorials/${tutorial.slug || tutorial.id}`)">
            <!-- Cover Image -->
            <div class="card-img-wrapper relative-position">
              <q-img 
                :src="tutorial.cover_image || 'https://placehold.co/600x400?text=Curso'" 
                :ratio="16/10"
                class="card-img"
              >
                <template v-slot:default>
                  <div class="absolute-top-right q-pa-sm">
                      <q-badge v-if="tutorial.is_public" color="green-5" label="Gratis" rounded class="shadow-1" />
                      <q-badge v-else color="amber-9" label="Premium" rounded class="shadow-1" icon="lock" />
                  </div>
                </template>
              </q-img>
              <!-- Play Overlay -->
              <div class="play-overlay absolute-full flex flex-center">
                 <span class="text-white text-subtitle2 bg-primary q-px-md q-py-xs rounded-borders">Ver Curso</span>
              </div>
            </div>

            <q-card-section class="col column q-px-md q-pt-md q-pb-sm">
              <div class="text-caption text-grey-6 text-uppercase text-weight-bold q-mb-xs">
                 {{ tutorial.modules?.length || 0 }} lecciones
              </div>
              <div class="text-subtitle1 text-weight-bold text-dark q-mb-xs ellipsis-2-lines section-title">
                {{ tutorial.title }}
              </div>
              
              <q-space />
              
              <div class="row items-center q-mt-sm">
                 <q-avatar size="24px" class="q-mr-sm">
                    <img src="https://ui-avatars.com/api/?name=Admin&background=random" />
                 </q-avatar>
                 <span class="text-caption text-grey-8">{{ tutorial.author_name || 'SIPPASE' }}</span>
              </div>
            </q-card-section>
            
            <q-separator color="grey-2" inset />
            
            <q-card-actions class="q-px-md q-py-sm row justify-between items-center bg-grey-1-light">
                 <div class="row items-center">
                    <q-icon name="star" color="amber" size="xs" />
                    <span class="text-weight-bold q-ml-xs text-grey-9">4.8</span>
                 </div>
                 <q-btn flat dense no-caps color="primary" label="Empezar" icon-right="arrow_right_alt" />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Join CTA Card (Always visible or only if few items?) -->
        <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-if="!authStore.token">
             <q-card class="tutorial-card full-height column flex-center bg-primary text-white text-center q-pa-lg cursor-pointer hover-scale" @click="showAuthModal = true">
                  <q-icon name="stars" size="4em" color="white" class="q-mb-md opacity-80" />
                  <div class="text-h5 text-weight-bold q-mb-sm">Acceso Total</div>
                  <p class="text-white-8 q-mb-lg">Regístrate gratis para acceder a todos los tutoriales, guardar tu progreso y obtener certificados.</p>
                  <q-btn unelevated color="white" text-color="primary" label="Crear Cuenta Gratis" rounded no-caps size="md" class="text-weight-bold shadow-2" />
             </q-card>
        </div>

      </div>
      
      <!-- Mobile View All Button -->
      <div class="row justify-center q-mt-xl lt-md">
        <q-btn v-if="!authStore.token" outline color="primary" label="Registrarse" class="q-mr-sm" @click="showAuthModal = true" />
        <q-btn flat color="primary" label="Ver todos" to="/tutorials" />
      </div>

    </div>

    <!-- Auth Modal Integration -->
    <AuthModal v-model="showAuthModal" />

  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '../boot/axios';
import { useAuthStore } from '../stores/authStore';
import AuthModal from './AuthModal.vue';

const props = defineProps({
  title: String,
  subtitle: String,
  titleColor: {
    type: String,
    default: '#1a202c'
  },
  sectionId: {
    type: String,
    default: 'tutorials'
  },
  bgSettings: {
    type: Object,
    default: () => ({ type: 'solid', color: '#f8fafc' })
  }
});

const authStore = useAuthStore();
const tutorials = ref([]);
const loading = ref(true);
const showAuthModal = ref(false);

const sectionStyle = computed(() => {
  const { type, color, gradientType, gradientDirection, gradientColor1, gradientColor2, image, imageSize, overlay, overlayOpacity } = props.bgSettings;
  
  const style = {
    padding: '100px 0',
  };

  if (type === 'solid') {
    style.backgroundColor = color;
  } else if (type === 'gradient') {
    style.background = gradientType === 'linear' 
      ? `linear-gradient(${gradientDirection}, ${gradientColor1}, ${gradientColor2})`
      : `radial-gradient(circle, ${gradientColor1}, ${gradientColor2})`;
  } else if (type === 'image' && image) {
    let bgImage = `url(${image})`;
    if (overlay) {
      const opacity = overlayOpacity / 100;
      const rgba = hexToRgba(overlay, opacity);
      bgImage = `linear-gradient(${rgba}, ${rgba}), url(${image})`;
    }
    style.backgroundImage = bgImage;
    style.backgroundSize = imageSize;
    style.backgroundPosition = 'center';
  } else {
    style.backgroundColor = '#f8fafc'; 
  }

  return style;
});

const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const fetchTutorials = async () => {
    try {
        const response = await api.get('/tutorials?status=published');
        tutorials.value = response.data;
    } catch (e) {
        console.error('Failed to fetch public tutorials', e);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchTutorials();
});
</script>

<style scoped>
.tutorials-section {
  position: relative;
  overflow: hidden;
}

.font-inter {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.rounded-borders-xl {
    border-radius: 20px;
}

.rounded-borders-top-xl {
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
}

.tutorial-card {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 20px;
  border: none;
  background: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
  cursor: pointer;
}

.tutorial-card:hover, .hover-scale:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card-img-wrapper {
  overflow: hidden;
  border-radius: 20px;
  margin: 8px;
}

.card-img {
  border-radius: 16px;
}

.play-overlay {
  background: rgba(0,0,0,0.2);
  opacity: 0;
  transition: all 0.3s ease;
}

.tutorial-card:hover .play-overlay {
  opacity: 1;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-white-8 {
    color: rgba(255,255,255,0.9);
}

.bg-grey-1-light {
    background-color: #fcfcfc;
}
</style>
