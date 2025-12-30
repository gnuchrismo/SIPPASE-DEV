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
const statisticsController = require('../controllers/statisticsController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/', statisticsController.getAllStatistics);
router.get('/category/:category', statisticsController.getStatisticsByCategory);
router.get('/summary', statisticsController.getStatisticsSummary);
router.get('/:id', statisticsController.getStatistic);

// Protected routes (require authentication)
router.post('/', authenticateToken, statisticsController.createStatistic);
router.post('/bulk', authenticateToken, statisticsController.bulkCreateStatistics);
router.put('/:id', authenticateToken, statisticsController.updateStatistic);
router.delete('/:id', authenticateToken, statisticsController.deleteStatistic);

module.exports = router;
