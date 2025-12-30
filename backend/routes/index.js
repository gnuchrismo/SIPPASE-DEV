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

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/systems', require('./systemRoutes'));
router.use('/sliders', require('./sliderRoutes'));
router.use('/documents', require('./documentRoutes'));
router.use('/document-categories', require('./documentCategoryRoutes'));
router.use('/contacts', require('./contactRoutes'));
router.use('/media', require('./mediaRoutes'));
router.use('/audit-logs', require('./auditRoutes'));
router.use('/roles', require('./roleRoutes'));
router.use('/permissions', require('./permissionRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/statistics', require('./statisticsRoutes'));
router.use('/2fa', require('./twoFactorRoutes'));
router.use('/password-reset', require('./passwordResetRoutes'));
router.use('/complaints', require('./complaintsRoutes'));
router.use('/settings', require('./settingsRoutes'));
router.use('/menus', require('./menuRoutes'));
router.use('/alerts', require('./alertRoutes'));
router.use('/blog', require('./blogRoutes'));
router.use('/seo', require('./seoRoutes'));
router.use('/analytics', require('./analyticsRoutes'));
router.use('/pages', require('./pagesRoutes'));
router.use('/tutorials', require('./tutorialRoutes'));

module.exports = router;
