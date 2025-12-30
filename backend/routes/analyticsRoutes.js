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

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, checkPermission } = require('../middleware/authMiddleware');

/**
 * Rutas públicas (sin autenticación)
 */

// POST /api/analytics/track - Rastrear visualización de página
router.post('/track', analyticsController.trackPageView);

/**
 * Rutas protegidas (requieren autenticación de administrador)
 */

// GET /api/analytics/stats?period=7d - Obtener estadísticas
router.get('/stats', authenticateToken, checkPermission('manage_settings'), analyticsController.getStats);

// POST /api/analytics/cleanup - Limpiar datos antiguos (mantenimiento)
router.post('/cleanup', authenticateToken, checkPermission('manage_settings'), analyticsController.cleanOldData);

module.exports = router;
 
