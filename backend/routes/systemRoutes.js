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
const systemController = require('../controllers/systemController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/', systemController.getAllSystems);
router.get('/:id', systemController.getSystem);

// Protected routes (require authentication)
router.post('/', authenticateToken, systemController.upload.single('icon'), systemController.createSystem);
router.put('/:id', authenticateToken, systemController.upload.single('icon'), systemController.updateSystem);
router.delete('/:id', authenticateToken, systemController.deleteSystem);
router.post('/reorder', authenticateToken, systemController.reorderSystems);

module.exports = router;
