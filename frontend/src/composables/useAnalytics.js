/*
 * Proyecto: PORTAL SIPPASE - ROBITCMS
 * Autor: Christian Mollo
 * Contacto: gnuchrismo@gmail.com | LinkedIn: https://www.linkedin.com/in/gnuchrismo/?locale=es_ES
 * Patrocinado por: UNWOMEN - Especialista en Desarrollo de Sistemas SIPPASE, Nov - Dic 2025
 *
 * Licencia: PROPIETARIA - Uso exclusivo autorizado para la entidad beneficiaria.
 * Queda prohibida la copia, distribución, modificación o uso no autorizado.
 *
 * Advertencia: Algunas partes de este proyecto utilizan librerías o frameworks
 * de terceros bajo licencias propias (por ejemplo Quasar Framework - MIT License).
 * Se debe cumplir con todas las licencias externas involucradas.
 *
 * © 2025 Desarrollado por Christian Mollo - UNWOMEN - Especialista en Desarrollo de Sistemas SIPPASE, Nov - Dic 2025, Todos los derechos reservados.
 */

import { api } from '../boot/axios';
import { v4 as uuidv4 } from 'uuid';

/**
 * Composable para tracking de analíticas
 * Gestiona el seguimiento de páginas visitadas y eventos en el sitio público
 */

/**
 * Obtener o crear un session ID único para el visitante
 * Se almacena en sessionStorage para persistir durante la sesión del navegador
 */
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('analytics_session', sessionId);
  }
  return sessionId;
};

/**
 * Hook principal de analytics
 */
export const useAnalytics = () => {
  /**
   * Rastrear visualización de página
   * @param {Object} route - Objeto de ruta de Vue Router
   */
  const trackPageView = async (route) => {
    try {
      const sessionId = getSessionId();
      
      // Solo rastrear en producción o si está habilitado en desarrollo
      const isDev = import.meta.env.DEV;
      const trackInDev = import.meta.env.VITE_TRACK_ANALYTICS_IN_DEV === 'true';
      
      if (isDev && !trackInDev) {
        console.debug('[Analytics] Tracking disabled in development');
        return;
      }
      
      // Preparar datos del tracking
      const trackingData = {
        url: route.fullPath,
        pageTitle: document.title,
        referrer: document.referrer || '',
        sessionId
      };
      
      // Enviar tracking de forma asíncrona sin bloquear la navegación
      api.post('/analytics/track', trackingData).catch(error => {
        // Fallar silenciosamente - las analíticas no deben interrumpir la UX
        console.debug('[Analytics] Tracking failed:', error.message);
      });
    } catch (error) {
      // Fallar silenciosamente para no afectar la experiencia del usuario
      console.debug('[Analytics] Error in trackPageView:', error);
    }
  };
  
  /**
   * Rastrear evento personalizado
   * @param {string} eventType - Tipo de evento (ej: 'click', 'download', 'form_submit')
   * @param {string} eventCategory - Categoría del evento
   * @param {string} eventLabel - Etiqueta descriptiva
   * @param {number} eventValue - Valor numérico opcional
   */
  const trackEvent = async (eventType, eventCategory, eventLabel, eventValue = null) => {
    try {
      const sessionId = getSessionId();
      
      const eventData = {
        sessionId,
        eventType,
        eventCategory,
        eventLabel,
        eventValue,
        pageUrl: window.location.pathname
      };
      
      api.post('/analytics/events', eventData).catch(error => {
        console.debug('[Analytics] Event tracking failed:', error.message);
      });
    } catch (error) {
      console.debug('[Analytics] Error in trackEvent:', error);
    }
  };
  
  /**
   * Obtener estadísticas (solo para admin)
   * @param {string} period - Período de tiempo ('7d', '30d', '90d')
   */
  const getStatistics = async (period = '7d') => {
    try {
      const response = await api.get('/analytics/stats', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('[Analytics] Error fetching statistics:', error);
      throw error;
    }
  };
  
  return {
    trackPageView,
    trackEvent,
    getStatistics,
    getSessionId
  };
};
