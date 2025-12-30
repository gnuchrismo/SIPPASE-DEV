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
const auditController = require('../controllers/auditController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRole(['admin']));

// Get audit logs with filtering
router.get('/', auditController.getAuditLogs);

// Get audit statistics
router.get('/stats', auditController.getAuditStats);

// Export audit logs
router.get('/export', auditController.exportAuditLogs);

// Get filter options (users, actions, entities)
router.get('/filter-options', auditController.getFilterOptions);

// Retention policy
router.get('/retention', auditController.getRetentionPolicy);
router.put('/retention', auditController.updateRetentionPolicy);

// Clean old logs
router.delete('/clean', auditController.cleanOldLogs);

module.exports = router;
