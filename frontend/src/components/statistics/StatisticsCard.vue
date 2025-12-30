<template>
  <div class="stat-card" :class="{ 'is-gradient': gradient }">
    <div class="stat-card-content">
      <div v-if="icon" class="stat-icon-wrapper">
        <q-icon :name="icon" class="stat-icon" />
      </div>
      
      <div class="stat-info">
        <div class="stat-value">{{ value }}</div>
        <div class="stat-title">{{ title }}</div>
        <div v-if="subtitle" class="stat-subtitle">{{ subtitle }}</div>
        <div v-if="meta" class="stat-meta text-caption text-grey-6 q-mt-xs">{{ meta }}</div>
      </div>

      <!-- Optional decorative element -->
      <div v-if="gradient" class="card-decoration">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="20" r="30" fill="white" fill-opacity="0.1"/>
          <circle cx="90" cy="80" r="40" fill="white" fill-opacity="0.05"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  meta: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  gradient: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.stat-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.is-gradient {
  background: linear-gradient(135deg, #6B46C1 0%, #4F46E5 100%);
  color: white;
}

.stat-card-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.stat-icon-wrapper {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 48px;
}

.is-gradient .stat-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
}

.stat-icon {
  font-size: 24px;
  color: #4F46E5;
}

.is-gradient .stat-icon {
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.stat-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #64748B;
  margin-bottom: 4px;
}

.is-gradient .stat-title {
  color: rgba(255, 255, 255, 0.9);
}

.stat-subtitle {
  font-size: 0.85rem;
  color: #94A3B8;
  font-weight: 500;
}

.is-gradient .stat-subtitle {
  color: rgba(255, 255, 255, 0.7);
}

.card-decoration {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
}
</style>
