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
const documentController = require('../controllers/documentController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Public route - get all documents
router.get('/', documentController.getAllDocuments);
router.get('/by-category', documentController.getDocumentsByCategory);
router.get('/:id', documentController.getDocument);

// Protected routes
router.post('/', authenticateToken, authorizeRole(['admin', 'editor']), documentController.upload.single('file'), documentController.createDocument);
router.put('/:id', authenticateToken, authorizeRole(['admin', 'editor']), documentController.upload.single('file'), documentController.updateDocument);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), documentController.deleteDocument);

module.exports = router;
