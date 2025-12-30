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
const documentCategoryController = require('../controllers/documentCategoryController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Public routes - get active categories
router.get('/', documentCategoryController.getActiveCategories);

// Protected routes - admin/editor only
router.get('/all', authenticateToken, authorizeRole(['admin', 'editor']), documentCategoryController.getAllCategories);
router.get('/:id', authenticateToken, authorizeRole(['admin', 'editor']), documentCategoryController.getCategory);
router.post('/', authenticateToken, authorizeRole(['admin', 'editor']), documentCategoryController.createCategory);
router.put('/reorder', authenticateToken, authorizeRole(['admin', 'editor']), documentCategoryController.reorderCategories);
router.put('/:id', authenticateToken, authorizeRole(['admin', 'editor']), documentCategoryController.updateCategory);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), documentCategoryController.deleteCategory);

module.exports = router;
