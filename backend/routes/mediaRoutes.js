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
const mediaController = require('../controllers/mediaController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(authenticateToken, authorizeRole(['admin']));

// File operations
router.get('/', mediaController.getFiles);
router.get('/files', mediaController.getFiles);
router.post('/upload', mediaController.uploadMiddleware, mediaController.uploadFile);
router.put('/:id', mediaController.updateFile);
router.delete('/:id', mediaController.deleteFile);
router.post('/delete-multiple', mediaController.deleteMultipleFiles);
router.post('/:id/move', mediaController.moveFile);

// Folder operations
router.get('/folders', mediaController.getFolders);
router.post('/folders', mediaController.createFolder);

// Stats
router.get('/stats', mediaController.getFileStats);

module.exports = router;
