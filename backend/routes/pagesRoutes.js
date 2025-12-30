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
const pagesController = require('../controllers/pagesController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/published', pagesController.getPublishedPages);
router.get('/slug/:slug', pagesController.getPageBySlug);

// Protected routes (authentication required)
router.get('/', authenticateToken, pagesController.getAllPages);
router.get('/:id', authenticateToken, pagesController.getPageById);
router.post('/', authenticateToken, pagesController.createPage);
router.put('/:id', authenticateToken, pagesController.updatePage);
router.delete('/:id', authenticateToken, pagesController.deletePage);

module.exports = router;
