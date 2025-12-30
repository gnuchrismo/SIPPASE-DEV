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
  <div class="loading-logo-container">
    <div class="logo-wrapper">
      <img 
        :src="logoUrl" 
        alt="Loading..." 
        class="loading-logo"
      >
      <div class="ripple"></div>
      <div class="ripple delay"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  logoUrl: {
    type: String,
    default: '/assets/images/logo.png'
  }
})
</script>

<style scoped>
.loading-logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.logo-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-logo {
  width: 60px;
  height: auto;
  z-index: 2;
  position: relative;
  animation: pulse 2s infinite ease-in-out;
}

.ripple {
  position: absolute;
  border: 4px solid rgba(102, 126, 234, 0.6);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: ripple 2s infinite cubic-bezier(0, 0.2, 0.8, 1);
  opacity: 0;
}

.ripple.delay {
  animation-delay: -1s;
}

@keyframes pulse {
  0% { transform: scale(0.95); }
  50% { transform: scale(1.05); }
  100% { transform: scale(0.95); }
}

@keyframes ripple {
  0% {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 1;
  }
  100% {
    top: -20px;
    left: -20px;
    width: calc(100% + 40px);
    height: calc(100% + 40px);
    opacity: 0;
  }
}
</style>
