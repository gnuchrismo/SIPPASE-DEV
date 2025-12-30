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
const seoController = require('../controllers/seoController');
const sitemapController = require('../controllers/sitemapController');
const { authenticateToken, checkPermission } = require('../middleware/authMiddleware');

// SEO Settings (Admin only)
router.get('/settings', authenticateToken, checkPermission('manage_settings'), seoController.getSeoSettings);
router.put('/settings', authenticateToken, checkPermission('manage_settings'), seoController.updateSeoSettings);

// Sitemap (Public) - Note: This might be mounted at /api/seo/sitemap.xml, 
// but usually we want it at /sitemap.xml. We can handle that in index.js or server.js
router.get('/sitemap.xml', sitemapController.generateSitemap);
router.get('/robots.txt', seoController.getRobotsTxt);

module.exports = router;
