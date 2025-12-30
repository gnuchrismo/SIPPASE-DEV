<template>
  <q-page class="q-pa-md builder-page">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md bg-white q-pa-sm rounded-borders shadow-1 sticky-header">
      <div class="row items-center">
        <q-btn flat round icon="arrow_back" to="/admin/tutorials" class="q-mr-sm" />
        <div>
          <div class="text-caption text-grey">Editando Tutorial</div>
          <div class="text-h6">{{ tutorial.title || 'Nuevo Tutorial' }}</div>
        </div>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-select
          dense
          outlined
          v-model="tutorial.status"
          :options="statusOptions"
          label="Estado"
          emit-value
          map-options
          options-dense
          style="min-width: 150px"
        />
        <q-btn
          color="primary"
          icon="save"
          label="Guardar Cambios"
          @click="saveTutorial"
          :loading="saving"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md" style="height: calc(100vh - 140px)">
      <!-- Left Sidebar: Structure (Outline) -->
      <div class="col-12 col-md-4 col-lg-3 h-100 column">
        <q-card class="col column shadow-1">
          <q-card-section class="bg-grey-1 q-py-sm row items-center justify-between">
            <div class="text-subtitle2">Contenido del Curso</div>
            <q-btn size="sm" color="primary" icon="add" label="Módulo" @click="addModule" flat />
          </q-card-section>

          <q-scroll-area class="col">
            <div class="q-pa-sm">
                <!-- Tutorial Settings Item -->
                <q-item 
                    clickable 
                    v-ripple 
                    @click="selectItem(null, 'settings')"
                    :active="selectedType === 'settings'"
                    active-class="bg-blue-1 text-primary"
                    class="rounded-borders q-mb-sm"
                >
                    <q-item-section avatar>
                        <q-icon name="settings" />
                    </q-item-section>
                    <q-item-section>Configuración General</q-item-section>
                </q-item>

                <q-separator class="q-my-sm" />

                <!-- Modules List with Drag & Drop -->
                <!-- Modules List with Drag & Drop -->
                <VueDraggable 
                    v-model="tutorial.modules" 
                    group="modules" 
                    handle=".module-handle"
                    @end="onModulesReordered"
                >
                    <div 
                        v-for="(module, mIndex) in tutorial.modules" 
                        :key="module.id"
                        class="q-mb-md bg-grey-1 rounded-borders overflow-hidden"
                    >
                             <!-- Module Header -->
                            <div class="row items-center q-pa-sm bg-grey-2 module-header">
                                <q-icon name="drag_indicator" class="cursor-move module-handle q-mr-sm text-grey" />
                                <div class="col text-weight-bold ellipsis cursor-pointer" @click="editModule(module)">
                                    {{ module.title }}
                                </div>
                                <q-btn size="xs" flat round icon="edit" @click.stop="editModule(module)" />
                                <q-btn size="xs" flat round icon="add" color="positive" @click.stop="addLesson(module.id)">
                                    <q-tooltip>Agregar Lección</q-tooltip>
                                </q-btn>
                                <q-btn size="xs" flat round icon="delete" color="negative" @click.stop="deleteModule(module.id)" />
                            </div>

                            <!-- Lessons List (Nested Drag & Drop) -->
                            <VueDraggable 
                                v-model="module.lessons" 
                                group="lessons" 
                                handle=".lesson-handle"
                                class="q-pl-sm"
                            >
                                    <q-item 
                                        v-for="(lesson, lIndex) in module.lessons"
                                        :key="lesson.id"
                                        clickable
                                        dense
                                        @click="selectItem(lesson, 'lesson')"
                                        :active="selectedItem?.id === lesson.id"
                                        active-class="bg-white text-primary"
                                        class="q-my-xs rounded-borders"
                                    >
                                        <q-item-section avatar style="min-width: 30px">
                                            <q-icon name="drag_handle" size="xs" class="cursor-move lesson-handle text-grey-5" />
                                        </q-item-section>
                                        <q-item-section avatar style="min-width: 30px">
                                            <q-icon :name="getLessonIcon(lesson.type)" size="xs" />
                                        </q-item-section>
                                        <q-item-section>
                                            <q-item-label lines="1" class="text-caption">{{ lesson.title }}</q-item-label>
                                        </q-item-section>
                                        <q-item-section side>
                                            <q-btn size="xs" flat round icon="close" color="grey-6" @click.stop="deleteLesson(lesson.id)" />
                                        </q-item-section>
                                    </q-item>
                            </VueDraggable>
                             <div v-if="!module.lessons || module.lessons.length === 0" class="text-caption text-grey text-center q-pa-xs">
                                Sin lecciones
                            </div>
                    </div>
                </VueDraggable>
            </div>
          </q-scroll-area>
        </q-card>
      </div>

      <!-- Right Content: Editor -->
      <div class="col-12 col-md-8 col-lg-9 h-100 column">
            <q-card class="col column shadow-1">
                <q-scroll-area class="col q-pa-md">
                    
                    <!-- 1. Tutorial Settings Editor -->
                    <div v-if="selectedType === 'settings'" class="q-pa-sm">
                        <div class="text-h6 q-mb-md">Configuración del Tutorial</div>
                        
                        <div class="row q-col-gutter-lg">
                            <div class="col-12 col-md-8">
                                <q-input v-model="tutorial.title" label="Título del Tutorial" outlined class="q-mb-md" :rules="[val => !!val || 'Requerido']" />
                                <q-input v-model="tutorial.slug" label="URL Friendly (Slug)" outlined class="q-mb-md" hint="Dejar vacío para autogenerar" />
                                <q-input v-model="tutorial.description" label="Descripción" type="textarea" outlined class="q-mb-md" rows="4" />
                                <q-toggle 
                                    v-model="tutorial.is_public" 
                                    :label="tutorial.is_public ? 'Tipo: Gratis / Público' : 'Tipo: Premium / Privado'" 
                                    color="green" 
                                    checked-icon="public"
                                    unchecked-icon="lock"
                                />
                            </div>
                            <div class="col-12 col-md-4">
                                <q-card class="my-card" bordered flat>
                                    <q-img :src="tutorial.cover_image || 'https://placehold.co/600x400'" style="height: 180px">
                                        <div class="absolute-bottom text-subtitle2 text-center">
                                            Portada
                                        </div>
                                    </q-img>
                                    <q-card-actions align="center">
                                        <q-btn flat label="Cambiar Imagen" color="primary" @click="openMediaSelector('cover')" />
                                    </q-card-actions>
                                </q-card>
                            </div>
                        </div>
                    </div>

                    <!-- 2. Lesson Editor -->
                    <div v-else-if="selectedType === 'lesson' && selectedItem" class="q-pa-sm">
                        <div class="row items-center q-mb-md">
                            <div class="text-h6 col">Editar Lección</div>
                            <q-chip outline color="primary" icon="timer">
                                <q-popup-edit v-model.number="selectedItem.duration_seconds" v-slot="scope">
                                    <q-input v-model.number="scope.value" dense autofocus label="Duración (seg)" type="number" @keyup.enter="scope.set" />
                                </q-popup-edit>
                                {{ formatDuration(selectedItem.duration_seconds) }}
                            </q-chip>
                        </div>

                        <q-input v-model="selectedItem.title" label="Título de la Lección" outlined class="q-mb-md" />
                        
                        <div class="row q-mb-md">
                            <q-btn-toggle
                                v-model="selectedItem.type"
                                spread
                                no-caps
                                toggle-color="primary"
                                color="white"
                                text-color="black"
                                :options="[
                                    {label: 'Video', value: 'video', icon: 'videocam'},
                                    {label: 'Artículo / Texto', value: 'article', icon: 'article'},
                                    {label: 'Quiz', value: 'quiz', icon: 'quiz'}
                                ]"
                            />
                        </div>

                        <div v-if="selectedItem.type === 'video'" class="q-mb-lg border-primary q-pa-md rounded-borders bg-grey-1">
                             <div class="text-subtitle2 q-mb-sm">Configuración de Video</div>
                             <div class="row q-col-gutter-sm">
                                <div class="col-grow">
                                    <q-input v-model="selectedItem.media_url" label="URL del Video (MP4, YouTube, Vimeo)" outlined>
                                        <template v-slot:append>
                                            <q-icon name="videocam" class="cursor-pointer" @click="openMediaSelector('video')">
                                                <q-tooltip>Seleccionar de Biblioteca</q-tooltip>
                                            </q-icon>
                                        </template>
                                    </q-input>
                                </div>
                             </div>
                             <div class="q-mt-sm text-caption text-grey">Pegue la URL directa o seleccione un archivo de la biblioteca.</div>
                        </div>

                        <!-- Article Editor (Rich Text) -->
                        <div v-else-if="selectedItem.type === 'article'">
                             <div class="text-subtitle2 q-mb-sm">Contenido del Artículo</div>
                              <q-editor
                                v-model="selectedItem.content"
                                :toolbar="[
                                    ['bold', 'italic', 'strike', 'underline'],
                                    ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
                                    ['undo', 'redo'],
                                    ['viewsource']
                                ]"
                                min-height="15rem"
                              />
                        </div>

                        <!-- Quiz Editor -->
                        <div v-else-if="selectedItem.type === 'quiz'">
                            <div class="row items-center justify-between q-mb-md">
                                <div class="text-subtitle2">Preguntas del Quiz</div>
                                <q-btn size="sm" color="primary" label="Agregar Pregunta" icon="add" @click="addQuizQuestion" />
                            </div>

                            <div v-if="!quizData.questions || quizData.questions.length === 0" class="text-center q-pa-lg text-grey bg-grey-1 rounded-borders dashed-border">
                                No hay preguntas. Agrega una para comenzar.
                            </div>

                            <div v-else class="q-gutter-y-md">
                                <q-card v-for="(question, qIndex) in quizData.questions" :key="question.id" bordered flat class="bg-grey-1">
                                    <q-card-section class="row items-start q-pb-none">
                                        <div class="text-weight-bold q-mt-xs q-mr-sm text-grey">{{ qIndex + 1 }}.</div>
                                        <q-input v-model="question.text" dense outlined class="col" label="Pregunta" autogrow />
                                        <q-btn flat round icon="delete" color="negative" size="sm" class="q-ml-sm" @click="removeQuizQuestion(qIndex)" />
                                    </q-card-section>

                                    <q-card-section class="q-pt-sm">
                                        <div class="text-caption text-grey-7 q-mb-xs q-ml-md">Opciones (Marca la correcta)</div>
                                        <div v-for="(option, oIndex) in question.options" :key="oIndex" class="row items-center q-mb-sm q-ml-md">
                                            <q-radio dense v-model="question.correctOptionIndex" :val="oIndex" size="sm" />
                                            <q-input v-model="option.text" dense outlined class="col q-ml-sm bg-white" placeholder="Opción" />
                                            <q-btn flat round icon="close" size="xs" color="grey" @click="removeQuizOption(qIndex, oIndex)" v-if="question.options.length > 2" />
                                        </div>
                                        <div class="q-ml-xl">
                                            <q-btn flat size="sm" icon="add" label="Agregar Opción" color="primary" @click="addQuizOption(qIndex)" />
                                        </div>
                                    </q-card-section>
                                </q-card>
                            </div>
                        </div>

                    </div>

                    <div v-else class="flex flex-center h-100 text-grey-6 column">
                        <q-icon name="touch_app" size="64px" class="q-mb-md" />
                        <div class="text-h6">Seleccione un elemento para editar</div>
                    </div>

                </q-scroll-area>
            </q-card>
      </div>
    </div>

    <!-- Dialogs -->
    <q-dialog v-model="showModuleDialog">
        <q-card style="min-width: 350px">
            <q-card-section>
                <div class="text-h6">{{ editingModuleId ? 'Editar Módulo' : 'Nuevo Módulo' }}</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <q-input dense v-model="moduleForm.title" autofocus label="Título del Módulo" @keyup.enter="saveModuleForm" />
                <q-input dense v-model="moduleForm.description" label="Descripción (Opcional)" class="q-mt-sm" />
            </q-card-section>

            <q-card-actions align="right" class="text-primary">
                <q-btn flat label="Cancelar" v-close-popup />
                <q-btn flat label="Guardar" @click="saveModuleForm" />
            </q-card-actions>
        </q-card>
    </q-dialog>

    <!-- Media Selector Dialog -->
    <q-dialog v-model="showMediaSelector" full-width>
        <q-card style="min-height: 80vh">
            <q-card-section class="row items-center q-pb-none">
                <div class="text-h6">Seleccionar Archivo</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>
            <q-card-section class="q-pa-none h-100">
                <MediaLibrary 
                    selection-mode 
                    :initial-filter-type="mediaSelectorType === 'cover' ? 'image' : 'video'"
                    @select="onMediaSelected"
                />
            </q-card-section>
        </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>

import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTutorialStore } from '../../../stores/tutorialStore';
import MediaLibrary from '../MediaLibrary.vue';
import { useQuasar } from 'quasar';
import { VueDraggable } from 'vue-draggable-plus';

const route = useRoute();
const router = useRouter();
const store = useTutorialStore();
const $q = useQuasar();

const saving = ref(false);
const showModuleDialog = ref(false);
const showMediaSelector = ref(false);
const mediaSelectorType = ref('cover'); // 'cover' | 'video'
const editingModuleId = ref(null);
const moduleForm = ref({ title: '', description: '' });

// State Declarations (Must be before watchers)
const selectedType = ref('settings'); // 'settings' | 'lesson'
const selectedItem = ref(null); // The actual lesson object being edited

const tutorial = ref({
    title: '',
    slug: '',
    description: '',
    status: 'draft',
    is_public: false,
    modules: [] // Modules contain lessons
});

// Quiz State
const quizData = ref({
    questions: []
});

const statusOptions = [
    { label: 'Borrador', value: 'draft' },
    { label: 'Publicado', value: 'published' },
    { label: 'Archivado', value: 'archived' }
];

// --- Watchers ---

// Sync Quiz Data with Selected Item Content
watch(() => selectedItem.value, (newItem) => {
    if (newItem && newItem.type === 'quiz') {
        try {
            const parsed = JSON.parse(newItem.content || '{"questions":[]}');
            // Ensure structure
            if (!parsed.questions) parsed.questions = [];
            quizData.value = parsed;
        } catch (e) {
            quizData.value = { questions: [] };
        }
    }
}, { immediate: true });

watch(quizData, (newVal) => {
    if (selectedItem.value && selectedItem.value.type === 'quiz') {
        selectedItem.value.content = JSON.stringify(newVal);
    }
}, { deep: true });

// Auto-generate slug from title if it's new or empty
watch(() => tutorial.value.title, (newTitle) => {
    if (!tutorial.value.id || !tutorial.value.slug) {
         tutorial.value.slug = generateSlug(newTitle);
    }
});

// Auto-detect duration when media_url changes
watch(() => selectedItem.value?.media_url, (newUrl) => {
    if (newUrl && selectedItem.value && selectedItem.value.type === 'video') {
        const video = document.createElement('video');
        video.src = newUrl;
        video.onloadedmetadata = () => {
             selectedItem.value.duration_seconds = Math.floor(video.duration);
        };
    }
});

// --- Helpers ---

// Slugify helper
const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Separate accents
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start
        .replace(/-+$/, ''); // Trim - from end
};

// Helper: Get Icon
const getLessonIcon = (type) => {
    if (type === 'video') return 'videocam';
    if (type === 'article') return 'article';
    if (type === 'quiz') return 'quiz';
    return 'circle';
};

// Helper: Duration
const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

// --- Actions ---

const selectItem = (item, type) => {
    selectedType.value = type;
    selectedItem.value = item;
    // Fix: Ensure content is not null for articles/quizzes to avoid QEditor prop warning
    if (selectedItem.value && selectedItem.value.content === null) {
        selectedItem.value.content = '';
    }
};

const addModule = () => {
    moduleForm.value = { title: '', description: '' };
    editingModuleId.value = null;
    showModuleDialog.value = true;
};

const editModule = (module) => {
    moduleForm.value = { title: module.title, description: module.description };
    editingModuleId.value = module.id;
    showModuleDialog.value = true;
};

const saveModuleForm = async () => {
    if (!moduleForm.value.title) return;
    showModuleDialog.value = false;

    if (!tutorial.value.id) {
         $q.notify({type: 'warning', message: 'Guarde el tutorial básico primero antes de agregar módulos.'});
         return; 
    }

    try {
        if (editingModuleId.value) {
            await store.updateModule(editingModuleId.value, { ...moduleForm.value });
             const modIndex = tutorial.value.modules.findIndex(m => m.id === editingModuleId.value);
            if (modIndex !== -1) {
                tutorial.value.modules[modIndex].title = moduleForm.value.title;
                tutorial.value.modules[modIndex].description = moduleForm.value.description;
            }
        } else {
            const newMod = await store.createModule({
                tutorial_id: tutorial.value.id,
                ...moduleForm.value,
                order_index: tutorial.value.modules.length
            });
            newMod.lessons = [];
            tutorial.value.modules.push(newMod);
        }
    } catch (e) {
        console.error(e);
    }
};

const deleteModule = (id) => {
    $q.dialog({
        title: 'Borrar Módulo', 
        message: 'Esto borrará también todas las lecciones dentro. ¿Continuar?', 
        cancel: true
    }).onOk(async () => {
        await store.deleteModule(id);
        tutorial.value.modules = tutorial.value.modules.filter(m => m.id !== id);
    });
};

const addLesson = async (moduleId) => {
    if (!tutorial.value.id) return;
    try {
        const module = tutorial.value.modules.find(m => m.id === moduleId);
        const orderIndex = module.lessons ? module.lessons.length : 0;

        const newLesson = await store.createLesson({
            module_id: moduleId,
            title: 'Nueva Lección',
            type: 'video',
            content: '', 
            order_index: orderIndex
        });
        
        module.lessons.push(newLesson);
        selectItem(newLesson, 'lesson');
    } catch (e) { console.error(e); }
};

const deleteLesson = (id) => {
    $q.dialog({title: 'Borrar Lección', message: '¿Seguro?', cancel: true}).onOk(async () => {
        await store.deleteLesson(id);
        tutorial.value.modules.forEach(m => {
            if(m.lessons) m.lessons = m.lessons.filter(l => l.id !== id);
        });
        if (selectedItem.value && selectedItem.value.id === id) {
             selectItem(null, 'settings');
        }
    });
};

const saveTutorial = async () => {
    saving.value = true;
    try {
        let savedTutorial;
        if (tutorial.value.id) {
            savedTutorial = await store.updateTutorial(tutorial.value.id, {
                title: tutorial.value.title,
                slug: tutorial.value.slug,
                description: tutorial.value.description,
                status: tutorial.value.status,
                cover_image: tutorial.value.cover_image,
                is_public: tutorial.value.is_public
            });
        } else {
            savedTutorial = await store.createTutorial(tutorial.value);
            tutorial.value.id = savedTutorial.id;
            router.replace(`/admin/tutorials/${savedTutorial.id}/edit`);
        }

        if (selectedType.value === 'lesson' && selectedItem.value) {
            await store.updateLesson(selectedItem.value.id, selectedItem.value);
        }

        $q.notify({ type: 'positive', message: 'Guardado correctamente' });
    } catch (e) {
        $q.notify({ type: 'negative', message: 'Error al guardar' });
    } finally {
        saving.value = false;
    }
};

const openMediaSelector = (type) => {
    mediaSelectorType.value = type;
    showMediaSelector.value = true;
};

const onMediaSelected = (file) => {
    if (mediaSelectorType.value === 'cover') {
        tutorial.value.cover_image = file.url;
    } else if (mediaSelectorType.value === 'video' && selectedItem.value) {
        selectedItem.value.media_url = file.url;
    }
    showMediaSelector.value = false;
};

const addQuizQuestion = () => {
    if (!quizData.value.questions) quizData.value.questions = [];
    quizData.value.questions.push({
        id: Date.now().toString(),
        text: '',
        options: [
            { text: '' },
            { text: '' }
        ],
        correctOptionIndex: 0
    });
};

const removeQuizQuestion = (index) => {
    quizData.value.questions.splice(index, 1);
};

const addQuizOption = (qIndex) => {
    quizData.value.questions[qIndex].options.push({ text: '' });
};

const removeQuizOption = (qIndex, oIndex) => {
    quizData.value.questions[qIndex].options.splice(oIndex, 1);
    if (quizData.value.questions[qIndex].correctOptionIndex >= oIndex) {
        quizData.value.questions[qIndex].correctOptionIndex = Math.max(0, quizData.value.questions[qIndex].correctOptionIndex - 1);
    }
};

const onModulesReordered = async () => {
    if (!tutorial.value.modules) return;
    
    try {
        const promises = tutorial.value.modules.map((mod, index) => {
             return store.updateModule(mod.id, { 
                title: mod.title,
                description: mod.description,
                order_index: index 
             });
        });
        
        await Promise.all(promises);
        $q.notify({ type: 'positive', message: 'Orden actualizado', position: 'bottom-right' });
    } catch (e) {
        console.error('Failed to reorder modules', e);
        $q.notify({ type: 'negative', message: 'Error al reordenar módulos' });
    }
};

// Init
onMounted(async () => {
    const id = route.params.id;
    if (id) {
        try {
            const data = await store.fetchTutorialDetails(id);
            tutorial.value = JSON.parse(JSON.stringify(data)); 
            if (!tutorial.value.modules) tutorial.value.modules = [];
            
            // Sanitization: Ensure all lessons have content string (even if empty)
            tutorial.value.modules.forEach(mod => {
                if (mod.lessons) {
                    mod.lessons.forEach(lesson => {
                        if (lesson.content === null || lesson.content === undefined) {
                            lesson.content = '';
                        }
                    });
                }
            });
        } catch (e) {
            router.push('/admin/tutorials');
        }
    }
});

</script>

<style scoped>
.builder-page {
    background-color: #f5f5f5;
}
.sticky-header {
    position: sticky;
    top: 0;
    z-index: 100;
}
</style>
