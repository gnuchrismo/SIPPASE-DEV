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
const menuController = require('../controllers/menuController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/public', menuController.getPublicMenu);

// Protected routes (authentication required)
router.get('/categories', authenticateToken, menuController.getCategories);
router.get('/categories/:id/items', authenticateToken, menuController.getItemsByCategory);
router.get('/admin', authenticateToken, menuController.getAdminMenu);
router.get('/routes', authenticateToken, menuController.getRouteMetadata);

// Admin-only routes
router.post('/items', authenticateToken, authorizeRole(['admin']), menuController.createMenuItem);
router.put('/items/reorder', menuController.reorderMenuItems);
router.put('/items/:id', authenticateToken, authorizeRole(['admin']), menuController.updateMenuItem);
router.delete('/items/:id', authenticateToken, authorizeRole(['admin']), menuController.deleteMenuItem);

module.exports = router;
