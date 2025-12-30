<template>
  <q-page class="q-pa-md">
    <div class="text-center q-mb-xl">
      <h1 class="text-h3 text-weight-bold text-primary">Tutoriales y Cursos</h1>
      <p class="text-subtitle1 text-grey-8">Aprende nuevas habilidades con nuestros tutoriales interactivos.</p>
    </div>

    <div v-if="loading" class="row justify-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else class="row q-col-gutter-lg justify-center">
      <div v-for="tutorial in tutorials" :key="tutorial.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card class="my-card h-100 column cursor-pointer hover-effect" @click="$router.push(`/tutorials/${tutorial.slug}`)">
          <q-img :src="tutorial.cover_image || 'https://placehold.co/600x400'" :ratio="16/9">
             <div class="absolute-bottom text-subtitle2 text-center" v-if="tutorial.category">
               {{ tutorial.category.name }}
             </div>
          </q-img>

          <q-card-section class="col">
            <div class="text-h6 q-mb-xs">{{ tutorial.title }}</div>
            <div class="text-caption text-grey ellipsis-3-lines">
              {{ tutorial.description }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn flat color="primary" label="Comenzar" icon-right="arrow_forward" />
          </q-card-actions>
        </q-card>
      </div>
      
      <div v-if="tutorials.length === 0" class="text-center text-grey q-mt-xl">
          <q-icon name="school" size="4em" />
          <div class="text-h6">No hay tutoriales disponibles aún.</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTutorialStore } from '../../stores/tutorialStore';

const store = useTutorialStore();
const tutorials = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    await store.fetchTutorials({ status: 'published' });
    tutorials.value = store.tutorials;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.hover-effect {
    transition: transform 0.2s;
}
.hover-effect:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}
</style>
