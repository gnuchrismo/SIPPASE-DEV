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
const contactController = require('../controllers/contactController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Public route - no authentication required
router.post('/submit', contactController.submitMessage);

// All routes below require authentication and admin role
router.use(authenticateToken, authorizeRole(['admin']));

router.get('/', contactController.getMessages);
router.patch('/:id/read', contactController.markAsRead);
router.patch('/:id/archive', contactController.toggleArchive);
router.delete('/:id', contactController.deleteMessage);
router.post('/:id/reply', contactController.replyMessage);

module.exports = router;
