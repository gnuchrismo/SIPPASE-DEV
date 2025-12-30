<template>
  <div class="tutorial-viewer-layout font-inter">
    <template v-if="loading">
       <div class="fullscreen flex flex-center bg-white">
          <q-spinner-dots size="4em" color="primary" />
       </div>
    </template>
    
    <template v-else-if="!tutorial">
        <div class="fullscreen flex flex-center column">
            <q-icon name="sentiment_dissatisfied" size="4em" color="grey-5" />
            <div class="text-h5 text-grey-8 q-my-md">Tutorial no encontrado</div>
            <q-btn to="/tutorials" label="Volver al catálogo" outline color="primary" class="q-mt-sm" />
        </div>
    </template>

    <template v-else>
        <q-layout view="lhh LpR lff" container style="height: 100vh" class="shadow-2 rounded-borders bg-white">
            <!-- Header -->
            <q-header class="bg-white text-dark shadow-1 q-py-xs" bordered>
                <q-toolbar>
                    <q-btn flat round dense icon="menu" @click="drawer = !drawer" color="grey-8" />
                    <q-toolbar-title class="text-subtitle1 text-weight-bold row items-center">
                         <q-avatar size="32px" class="q-mr-md" v-if="tutorial.cover_image">
                            <img :src="tutorial.cover_image">
                         </q-avatar>
                         {{ tutorial.title }}
                         <q-badge v-if="!canAccess" color="amber-9" class="q-ml-sm" label="Premium / Registro Requerido" />
                    </q-toolbar-title>
                    
                    <div class="row items-center q-gutter-md">
                        <div v-if="store.userProgress" class="text-caption text-grey-7 gt-xs">
                             <q-icon name="emoji_events" color="warning" />
                             Progreso: {{ Math.round(currentProgress * 100) }}%
                        </div>
                        <q-btn flat round icon="close" to="/tutorials" color="grey-6" />
                    </div>
                </q-toolbar>
                <q-linear-progress :value="currentProgress" color="primary" size="3px" track-color="grey-2" class="absolute-bottom" />
            </q-header>

            <!-- Sidebar -->
            <q-drawer v-model="drawer" show-if-above bordered :width="320" :breakpoint="768" class="bg-grey-1 side-menu">
                <div class="q-pa-md">
                    <div class="text-overline text-grey-7 q-mb-xs">CONTENIDO DEL CURSO</div>
                    <div v-if="!canAccess" class="bg-blue-1 text-blue-9 q-pa-sm rounded-borders text-caption q-mb-md">
                         <q-icon name="lock" size="xs" /> Inicia sesión para guardar tu progreso.
                    </div>
                </div>

                <q-scroll-area class="fit q-px-sm">
                    <q-list class="q-pb-lg">
                        <template v-for="(module, index) in tutorial.modules" :key="module.id">
                            <div class="q-mb-sm">
                                <q-item-label header class="text-weight-bold text-grey-9 q-py-sm text-uppercase text-caption bg-grey-2 rounded-borders q-mx-xs q-px-md">
                                    {{ module.title }}
                                </q-item-label>
                                
                                <q-list class="q-mt-xs">
                                    <q-item 
                                        v-for="lesson in module.lessons" 
                                        :key="lesson.id"
                                        clickable
                                        v-ripple
                                        :active="activeLesson?.id === lesson.id"
                                        active-class="bg-white text-primary shadow-1 rounded-borders"
                                        class="rounded-borders q-mx-xs q-mb-xs transition-hover"
                                        @click="selectLesson(lesson)"
                                        :disable="!canAccess && lesson.order_index > 0"
                                    >
                                        <q-item-section avatar style="min-width: 40px">
                                           <div class="relative-position">
                                               <q-icon 
                                                    :name="isLessonCompleted(lesson.id) ? 'check_circle' : (lesson.type === 'video' ? 'play_circle' : (lesson.type === 'quiz' ? 'quiz' : 'article'))" 
                                                    :color="isLessonCompleted(lesson.id) ? 'green-5' : 'grey-5'" 
                                                    size="20px"
                                                />
                                                <q-icon name="lock" size="12px" color="grey" class="absolute-bottom-right" v-if="!canAccess && lesson.order_index > 0" />
                                           </div>
                                        </q-item-section>
                                        <q-item-section>
                                            <q-item-label class="text-body2" :class="{'text-weight-medium': activeLesson?.id === lesson.id}">{{ lesson.title }}</q-item-label>
                                            <q-item-label caption v-if="lesson.duration_seconds" class="row items-center">
                                                {{ formatDuration(lesson.duration_seconds) }}
                                            </q-item-label>
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </div>
                        </template>
                    </q-list>
                </q-scroll-area>
            </q-drawer>

            <!-- Main Content -->
            <q-page-container class="bg-grey-1">
                <!-- Lock Screen for Restricted Content -->
                <q-page class="q-pa-md flex flex-center column" v-if="!canAccess && activeLesson?.order_index > 0">
                     <q-card class="text-center q-pa-xl shadow-3" style="max-width: 500px; border-radius: 16px">
                         <div class="bg-blue-1 q-pa-md rounded-circle inline-block q-mb-md">
                            <q-icon name="lock" size="4em" color="primary" />
                         </div>
                         <div class="text-h4 text-weight-bold q-mb-sm">Contenido Exclusivo</div>
                         <p class="text-grey-7 text-body1">Regístrate gratis para acceder a todo el contenido de este curso y seguir tu progreso.</p>
                         
                         <div class="q-gutter-md q-mt-lg">
                             <q-btn unelevated color="primary" label="Registrarse / Iniciar Sesión" size="lg" rounded @click="showAuthModal = true" />
                             <q-btn flat color="grey-8" label="Volver al inicio" to="/tutorials" />
                         </div>
                     </q-card>
                </q-page>

                <q-page class="q-pa-none flex flex-center" v-else-if="!activeLesson">
                    <div class="text-center" style="max-width: 600px">
                        <q-img :src="tutorial.cover_image" class="rounded-borders shadow-2 q-mb-lg" style="max-height: 300px; border-radius: 16px" />
                        <div class="text-h4 text-weight-bold q-mb-md">{{ tutorial.title }}</div>
                        <p class="text-body1 text-grey-8">{{ tutorial.description }}</p>
                        <q-btn color="primary" label="Comenzar Lección 1" size="lg" rounded unelevated class="q-mt-lg" @click="startCourse" icon-right="arrow_forward" />
                    </div>
                </q-page>

                <q-page class="scroll" v-else>
                     <div class="row justify-center q-py-lg">
                        <div class="col-12 col-md-10 col-lg-9 col-xl-8">
                            
                            <!-- Video Player -->
                            <div v-if="activeLesson.type === 'video'" class="video-wrapper shadow-3 rounded-borders overflow-hidden bg-black q-mb-lg">
                                <video 
                                    v-if="activeLesson.media_url && !activeLesson.media_url.includes('youtube') && !gameUrl(activeLesson.media_url)"
                                    :src="activeLesson.media_url" 
                                    controls 
                                    controlsList="nodownload"
                                    class="fit" 
                                    @ended="markCompleted"
                                ></video>
                                <div v-else class="fit relative-position iframe-container">
                                     <iframe 
                                        :src="getEmbedUrl(activeLesson.media_url)" 
                                        frameborder="0" 
                                        allowfullscreen
                                        class="absolute-top full-width full-height"
                                     ></iframe>
                                </div>
                            </div>

                            <div class="q-px-md">
                                <!-- Navigation & Titles -->
                                <div class="row justify-between items-start q-mb-md">
                                    <div>
                                        <div class="text-caption text-primary text-weight-bold text-uppercase q-mb-xs">LECCIÓN ACUAL</div>
                                        <div class="text-h4 text-weight-bold">{{ activeLesson.title }}</div>
                                    </div>
                                    <div class="row q-gutter-sm">
                                         <q-btn outline round color="grey-5" icon="chevron_left" :disable="!prevLesson" @click="selectLesson(prevLesson)">
                                            <q-tooltip>Anterior</q-tooltip>
                                         </q-btn>
                                         <q-btn outline round color="primary" icon="chevron_right" :disable="!nextLesson" @click="selectLesson(nextLesson)">
                                            <q-tooltip>Siguiente</q-tooltip>
                                         </q-btn>
                                    </div>
                                </div>

                                <q-separator class="q-my-md" />
                                
                                <!-- Content Body -->
                                <div class="text-body1 text-grey-9 q-mb-xl content-body" v-html="activeLesson.content || 'Sin descripción adicional.'"></div>

                                <!-- Action Footer -->
                                <div class="row justify-center q-pb-xl">
                                    <q-btn 
                                        v-if="canAccess"
                                        :color="isLessonCompleted(activeLesson.id) ? 'green-1' : 'primary'"
                                        :text-color="isLessonCompleted(activeLesson.id) ? 'green-9' : 'white'"
                                        :icon="isLessonCompleted(activeLesson.id) ? 'check_circle' : 'check'"
                                        :label="isLessonCompleted(activeLesson.id) ? 'Completada' : 'Marcar como Completada'"
                                        unelevated
                                        rounded
                                        size="lg"
                                        class="q-px-xl"
                                        @click="toggleCompleted"
                                    />
                                    <q-btn v-else color="primary" label="Regístrate para continuar" @click="showAuthModal = true" unelevated rounded />
                                </div>
                            </div>
                        </div>
                     </div>
                </q-page>
            </q-page-container>
        </q-layout>

        <AuthModal v-model="showAuthModal" @success="handleAuthSuccess" />

    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTutorialStore } from '../../stores/tutorialStore';
import { useAuthStore } from '../../stores/authStore';
import AuthModal from '../../components/AuthModal.vue';

const route = useRoute();
const router = useRouter();
const store = useTutorialStore();
const authStore = useAuthStore();

const drawer = ref(true);
const loading = ref(true);
const tutorial = ref(null);
const activeLesson = ref(null);
const showAuthModal = ref(false);

const formatDuration = (sec) => {
    if(!sec) return '00:00';
    return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
}

const canAccess = computed(() => {
    if (!tutorial.value) return false;
    // If public, accessible. If not public, need auth.
    // However, if NOT public, user sees Lock Screen on individual lessons?
    // User requested "Some courses... without auth".
    // "For those requiring registry... option to register".
    return tutorial.value.is_public || !!authStore.token;
});

// Navigation logic
const allLessons = computed(() => {
    if (!tutorial.value) return [];
    return tutorial.value.modules.flatMap(m => m.lessons || []);
});

const activeIndex = computed(() => allLessons.value.findIndex(l => l.id === activeLesson.value?.id));
const prevLesson = computed(() => activeIndex.value > 0 ? allLessons.value[activeIndex.value - 1] : null);
const nextLesson = computed(() => activeIndex.value < allLessons.value.length - 1 ? allLessons.value[activeIndex.value + 1] : null);

const currentProgress = computed(() => {
    if (!allLessons.value.length || !store.userProgress) return 0;
    // userProgress is map: { lessonId: { is_completed: true } }
    const completedCount = Object.values(store.userProgress).filter(p => p.is_completed).length; 
    return completedCount / allLessons.value.length;
});

const isLessonCompleted = (id) => !!store.userProgress[id]?.is_completed;

const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    if (url.includes('vimeo.com')) {
        const id = url.split('/').pop();
        return `https://player.vimeo.com/video/${id}`;
    }
    return url;
};

const gameUrl = (url) => false; // Placeholder

const selectLesson = (lesson) => {
    // Check access restrictions?
    // If !canAccess, maybe only allow first lesson as preview?
    // Let's allow clicking, but the VIEW will show Lock Screen if needed.
    activeLesson.value = lesson;
    window.scrollTo(0, 0);
    // On mobile, close drawer
    if (window.innerWidth < 768) drawer.value = false;
};

const startCourse = () => {
    if (allLessons.value.length > 0) selectLesson(allLessons.value[0]);
};

const markCompleted = async () => {
    if (!canAccess.value) return;
    if (activeLesson.value && !isLessonCompleted(activeLesson.value.id)) {
        await store.updateProgress({
            lesson_id: activeLesson.value.id,
            is_completed: true,
            time_watched_seconds: activeLesson.value.duration_seconds || 0
        });
    }
};

const toggleCompleted = async () => {
    if (!activeLesson.value || !canAccess.value) return;
    const isComplete = isLessonCompleted(activeLesson.value.id);
    await store.updateProgress({
        lesson_id: activeLesson.value.id,
        is_completed: !isComplete,
        time_watched_seconds: 0
    });
};

const handleAuthSuccess = async () => {
    // Reload tutorial to get progress and enrollment
    // We need to re-fetch details now that we have a token
    loading.value = true;
    try {
        const slug = route.params.slug;
        const data = await store.fetchTutorialDetails(slug);
        tutorial.value = data; // Update data with enrollment info
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    const slug = route.params.slug;
    try {
        const data = await store.fetchTutorialDetails(slug);
        tutorial.value = data;
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.tutorial-viewer-layout {
    height: 100vh;
    background: #f8f9fa;
}

.font-inter {
    font-family: 'Inter', sans-serif;
}

.video-wrapper {
    position: relative;
    width: 100%;
    /* Maintain 16:9 aspect ratio */
     height: 0;
     padding-bottom: 56.25%;
}

.video-wrapper video, .iframe-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.content-body {
    line-height: 1.8;
}

.transition-hover {
    transition: all 0.2s ease;
}

.transition-hover:hover {
    background-color: #f1f5f9; /* grey-2 */
}
</style>
