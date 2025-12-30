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
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, authorizeRole(['admin']), userController.getAllUsers);
router.post('/', authenticateToken, authorizeRole(['admin']), userController.createUser);
router.put('/:id', authenticateToken, authorizeRole(['admin']), userController.updateUser);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), userController.deleteUser);

// Role assignment routes
router.get('/:id/roles', authenticateToken, authorizeRole(['admin']), userController.getUserRoles);
router.put('/:id/roles', authenticateToken, authorizeRole(['admin']), userController.assignRoles);

module.exports = router;
