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
const sliderController = require('../controllers/sliderController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Public route - get all active sliders
router.get('/', sliderController.getAllSliders);

// Protected routes - require authentication
router.get('/:id', authenticateToken, sliderController.getSlider);
router.post('/', authenticateToken, authorizeRole(['admin', 'editor']), sliderController.upload.single('image'), sliderController.createSlider);
router.put('/:id', authenticateToken, authorizeRole(['admin', 'editor']), sliderController.upload.single('image'), sliderController.updateSlider);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), sliderController.deleteSlider);
router.post('/reorder', authenticateToken, authorizeRole(['admin', 'editor']), sliderController.reorderSliders);

module.exports = router;
