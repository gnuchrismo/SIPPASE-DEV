import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { Notify } from 'quasar';

export const useTutorialStore = defineStore('tutorial', {
  state: () => ({
    tutorials: [],
    currentTutorial: null,
    loading: false,
    error: null,
    userProgress: {}, // Map of lesson_id -> progress data
  }),

  getters: {
    getTutorialById: (state) => (id) => state.tutorials.find(t => t.id === Number(id)),
    isLessonCompleted: (state) => (lessonId) => !!state.userProgress[lessonId]?.is_completed,
  },

  actions: {
    async fetchTutorials(filters = {}) {
      this.loading = true;
      try {
        const response = await api.get('/tutorials', { params: filters });
        this.tutorials = response.data;
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching tutorials:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchTutorialDetails(id) {
      this.loading = true;
      this.currentTutorial = null;
      try {
        const response = await api.get(`/tutorials/${id}`);
        this.currentTutorial = response.data;
        
        if (response.data.user_enrollment && response.data.user_progress) {
             response.data.user_progress.forEach(p => {
                 this.userProgress[p.lesson_id] = { is_completed: p.is_completed };
             });
        }
        return response.data;
      } catch (error) {
        this.error = error.message;
        Notify.create({ type: 'negative', message: 'Error loading tutorial details' });
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createTutorial(tutorialData) {
      try {
        const response = await api.post('/tutorials', tutorialData);
        this.tutorials.unshift(response.data);
        Notify.create({ type: 'positive', message: 'Tutorial created successfully' });
        return response.data;
      } catch (error) {
        Notify.create({ type: 'negative', message: 'Failed to create tutorial' });
        throw error;
      }
    },

    async updateTutorial(id, tutorialData) {
      try {
        const response = await api.put(`/tutorials/${id}`, tutorialData);
        const index = this.tutorials.findIndex(t => t.id === id);
        if (index !== -1) this.tutorials[index] = response.data;
        if (this.currentTutorial?.id === id) this.currentTutorial = { ...this.currentTutorial, ...response.data };
        Notify.create({ type: 'positive', message: 'Tutorial updated successfully' });
        return response.data;
      } catch (error) {
        Notify.create({ type: 'negative', message: 'Failed to update tutorial' });
        throw error;
      }
    },

    async deleteTutorial(id) {
      try {
        await api.delete(`/tutorials/${id}`);
        this.tutorials = this.tutorials.filter(t => t.id !== id);
        Notify.create({ type: 'positive', message: 'Tutorial deleted' });
      } catch (error) {
        Notify.create({ type: 'negative', message: 'Failed to delete tutorial' });
        throw error;
      }
    },

    // --- Module & Lesson Actions ---

    async createModule(moduleData) {
      try {
        const response = await api.post('/tutorials/modules', moduleData);
        // Update local state if current tutorial is loaded
        if (this.currentTutorial && this.currentTutorial.id === moduleData.tutorial_id) {
             if (!this.currentTutorial.modules) this.currentTutorial.modules = [];
             this.currentTutorial.modules.push({...response.data, lessons: []});
        }
        return response.data;
      } catch (error) {
        Notify.create({ type: 'negative', message: 'Failed to create module' });
        throw error;
      }
    },
    
    async updateModule(id, moduleData) {
        try {
            const response = await api.put(`/tutorials/modules/${id}`, moduleData);
            if (this.currentTutorial) {
                const modIndex = this.currentTutorial.modules.findIndex(m => m.id === id);
                if (modIndex !== -1) {
                    this.currentTutorial.modules[modIndex] = { ...this.currentTutorial.modules[modIndex], ...response.data };
                }
            }
            return response.data;
        } catch (error) {
             Notify.create({ type: 'negative', message: 'Failed to update module' });
             throw error;
        }
    },

    async deleteModule(id) {
         try {
            await api.delete(`/tutorials/modules/${id}`);
            if (this.currentTutorial) {
                this.currentTutorial.modules = this.currentTutorial.modules.filter(m => m.id !== id);
            }
         } catch (error) {
             Notify.create({ type: 'negative', message: 'Failed to delete module' });
             throw error;
         }
    },

    async createLesson(lessonData) {
      try {
        const response = await api.post('/tutorials/lessons', lessonData);
        if (this.currentTutorial) {
            const module = this.currentTutorial.modules.find(m => m.id === lessonData.module_id);
            if (module) {
                if (!module.lessons) module.lessons = [];
                module.lessons.push(response.data);
            }
        }
        return response.data;
      } catch (error) {
        Notify.create({ type: 'negative', message: 'Failed to create lesson' });
        throw error;
      }
    },

    async updateLesson(id, lessonData) {
        try {
            const response = await api.put(`/tutorials/lessons/${id}`, lessonData);
            if (this.currentTutorial) {
                // Find module and lesson to update locally
                for (const mod of this.currentTutorial.modules) {
                    const lessonIndex = mod.lessons?.findIndex(l => l.id === id);
                    if (lessonIndex !== undefined && lessonIndex !== -1) {
                        mod.lessons[lessonIndex] = response.data;
                        break;
                    }
                }
            }
            return response.data;
        } catch (error) {
             Notify.create({ type: 'negative', message: 'Failed to update lesson' });
             throw error;
        }
    },

    async deleteLesson(id) {
         try {
            await api.delete(`/tutorials/lessons/${id}`);
            if (this.currentTutorial) {
                for (const mod of this.currentTutorial.modules) {
                    if (mod.lessons) {
                        mod.lessons = mod.lessons.filter(l => l.id !== id);
                    }
                }
            }
         } catch (error) {
             Notify.create({ type: 'negative', message: 'Failed to delete lesson' });
             throw error;
         }
    },

    async updateProgress(progressData) {
        try {
            await api.post('/tutorials/progress', progressData);
            // Update local state is tricky without full reload, but valid for UI feedback
            this.userProgress[progressData.lesson_id] = {
                is_completed: progressData.is_completed,
                // ... other fields
            };
        } catch (error) {
            console.error("Failed to save progress", error);
        }
    }
  }
});
