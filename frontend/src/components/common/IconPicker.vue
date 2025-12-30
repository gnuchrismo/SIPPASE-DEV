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
  <div class="icon-picker">
    <q-input
      :model-value="modelValue"
      label="Icono"
      outlined
      dense
      readonly
      class="cursor-pointer"
      @click="openPicker"
    >
      <template v-slot:prepend>
        <q-icon :name="modelValue || 'link'" />
      </template>
      <template v-slot:append>
        <q-icon name="arrow_drop_down" class="cursor-pointer" />
      </template>
    </q-input>

    <q-dialog v-model="showPicker" @show="onDialogShow">
      <q-card class="icon-picker-dialog">
        <q-card-section class="dialog-header">
          <div class="header-content">
            <div class="text-h6">Seleccionar Icono</div>
            <div class="header-actions">
              <q-btn 
                flat 
                dense 
                round 
                icon="help_outline" 
                @click="showHelp = !showHelp"
              >
                <q-tooltip>Atajos de teclado</q-tooltip>
              </q-btn>
              <q-btn flat dense round icon="close" v-close-popup />
            </div>
          </div>
          
          <!-- Help tooltip -->
          <q-slide-transition>
            <div v-if="showHelp" class="help-panel">
              <div class="help-item">
                <kbd>↑ ↓ ← →</kbd> <span>Navegar</span>
              </div>
              <div class="help-item">
                <kbd>Enter</kbd> <span>Seleccionar</span>
              </div>
              <div class="help-item">
                <kbd>Esc</kbd> <span>Cerrar</span>
              </div>
            </div>
          </q-slide-transition>
        </q-card-section>

        <q-card-section class="search-section">
          <q-input
            ref="searchInput"
            v-model="search"
            placeholder="Buscar icono..."
            dense
            outlined
            autofocus
            clearable
            @keydown="handleSearchKeydown"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-section class="tabs-section">
          <q-tabs
            v-model="activeTab"
            dense
            active-color="primary"
            indicator-color="primary"
            align="left"
            class="category-tabs"
          >
            <q-tab name="popular" label="Popular" :icon="'star'" />
            <q-tab 
              v-for="(category, key) in categories" 
              :key="key"
              :name="key" 
              :label="category.name"
              :icon="category.icon"
            />
          </q-tabs>
        </q-card-section>

        <q-separator />

        <q-card-section class="icons-section">
          <div class="icons-container" ref="iconsContainer" @keydown="handleKeydown" tabindex="0">
            <div v-if="filteredIcons.length === 0" class="empty-state">
              <q-icon name="search_off" size="48px" color="grey-5" />
              <p>No se encontraron iconos que coincidan con "{{ search }}"</p>
            </div>
            
            <div v-else class="icons-grid">
              <div
                v-for="(icon, index) in filteredIcons"
                :key="icon"
                :ref="el => iconRefs[index] = el"
                class="icon-item"
                :class="{ 
                  active: modelValue === icon,
                  highlighted: highlightedIndex === index
                }"
                @click="selectIcon(icon)"
                @mouseenter="highlightedIndex = index"
              >
                <q-icon :name="icon" size="24px" />
                <q-tooltip>{{ icon }}</q-tooltip>
              </div>
            </div>
            
            <div v-if="hasMore" class="load-more-hint">
              <q-icon name="info" size="16px" />
              <span>Mostrando {{ filteredIcons.length }} iconos. Usa el buscador para ver más.</span>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="footer-section">
          <div class="selected-preview">
            <template v-if="modelValue">
              <q-icon :name="modelValue" size="32px" />
              <span class="selected-name">{{ modelValue }}</span>
            </template>
            <span v-else class="text-grey-6">Ningún icono seleccionado</span>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { iconCategories, popularIcons, allIcons } from '../../utils/materialIcons'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const showPicker = ref(false)
const showHelp = ref(false)
const search = ref('')
const activeTab = ref('popular')
const highlightedIndex = ref(0)
const displayLimit = 300
const searchInput = ref(null)
const iconsContainer = ref(null)
const iconRefs = ref([])

const categories = iconCategories

const filteredIcons = computed(() => {
  let icons = []
  
  // Get icons based on active tab
  if (activeTab.value === 'popular') {
    icons = popularIcons
  } else if (categories[activeTab.value]) {
    icons = categories[activeTab.value].icons
  } else {
    icons = allIcons
  }
  
  // Apply search filter
  if (search.value) {
    const term = search.value.toLowerCase()
    icons = icons.filter(icon => icon.includes(term))
  }
  
  return icons.slice(0, displayLimit)
})

const hasMore = computed(() => {
  let totalCount = 0
  
  if (activeTab.value === 'popular') {
    totalCount = popularIcons.length
  } else if (categories[activeTab.value]) {
    totalCount = categories[activeTab.value].icons.length
  } else {
    totalCount = allIcons.length
  }
  
  if (search.value) {
    const term = search.value.toLowerCase()
    if (activeTab.value === 'popular') {
      totalCount = popularIcons.filter(icon => icon.includes(term)).length
    } else if (categories[activeTab.value]) {
      totalCount = categories[activeTab.value].icons.filter(icon => icon.includes(term)).length
    } else {
      totalCount = allIcons.filter(icon => icon.includes(term)).length
    }
  }
  
  return totalCount > displayLimit
})

// Reset highlighted index when filtered icons change
watch(filteredIcons, () => {
  highlightedIndex.value = 0
})

// Reset search when tab changes
watch(activeTab, () => {
  search.value = ''
  highlightedIndex.value = 0
})

function openPicker() {
  showPicker.value = true
}

function onDialogShow() {
  nextTick(() => {
    if (searchInput.value) {
      searchInput.value.focus()
    }
  })
}

function selectIcon(icon) {
  emit('update:modelValue', icon)
  showPicker.value = false
}

function handleKeydown(event) {
  const gridColumns = 8 // Approximate columns in grid
  const totalIcons = filteredIcons.value.length
  
  switch(event.key) {
    case 'ArrowRight':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, totalIcons - 1)
      scrollToHighlighted()
      break
    case 'ArrowLeft':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      scrollToHighlighted()
      break
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + gridColumns, totalIcons - 1)
      scrollToHighlighted()
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - gridColumns, 0)
      scrollToHighlighted()
      break
    case 'Enter':
      event.preventDefault()
      if (filteredIcons.value[highlightedIndex.value]) {
        selectIcon(filteredIcons.value[highlightedIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      showPicker.value = false
      break
  }
}

function handleSearchKeydown(event) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    iconsContainer.value?.focus()
  }
}

function scrollToHighlighted() {
  nextTick(() => {
    const element = iconRefs.value[highlightedIndex.value]
    if (element) {
      element.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  })
}
</script>

<style scoped>
.icon-picker-dialog {
  min-width: 600px;
  max-width: 80vw;
  max-height: 80vh;
}

.dialog-header {
  padding: 16px 20px 12px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.help-panel {
  margin-top: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.help-item kbd {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 11px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.search-section {
  padding: 0 20px 12px;
}

.tabs-section {
  padding: 0 20px;
}

.category-tabs {
  min-height: 40px;
}

.icons-section {
  padding: 16px 20px;
  flex: 1;
  overflow: hidden;
}

.icons-container {
  max-height: 400px;
  overflow-y: auto;
  outline: none;
}

.icons-container::-webkit-scrollbar {
  width: 8px;
}

.icons-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.icons-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.icons-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
  text-align: center;
}

.empty-state p {
  margin-top: 12px;
  margin-bottom: 0;
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 8px;
  padding: 4px;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  color: #555;
  position: relative;
}

.icon-item:hover {
  background: #f5f5f5;
  border-color: #e0e0e0;
  color: #000;
  transform: scale(1.08);
}

.icon-item.highlighted {
  background: #e3f2fd;
  border-color: #90caf9;
  color: #1976d2;
}

.icon-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.icon-item.active:hover {
  transform: scale(1.1);
}

.load-more-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: #fff3cd;
  border-radius: 8px;
  color: #856404;
  font-size: 13px;
}

.footer-section {
  padding: 12px 20px;
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
}

.selected-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 32px;
}

.selected-name {
  font-family: monospace;
  font-size: 14px;
  color: #333;
}

@media (max-width: 768px) {
  .icon-picker-dialog {
    min-width: 95vw;
    max-height: 90vh;
  }
  
  .icons-grid {
    grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
  }
  
  .help-panel {
    font-size: 12px;
  }
}
</style>
