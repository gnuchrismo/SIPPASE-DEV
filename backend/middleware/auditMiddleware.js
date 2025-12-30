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
const db = require('../db');

/**
 * Audit logging middleware and utility functions
 * Provides automatic logging of user actions for compliance and security
 */

/**
 * Core audit logging function
 * @param {number} userId - ID of the user performing the action
 * @param {string} action - Action being performed (create, update, delete, login, etc.)
 * @param {string} entity - Entity being affected (slider, system, user, etc.)
 * @param {number} entityId - ID of the affected entity
 * @param {object} details - Additional details (old/new values, etc.)
 * @param {object} req - Express request object (for IP and user agent)
 */
async function logAudit(userId, action, entity, entityId, details, req) {
    try {
        const username = req.user ? req.user.username : null;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent') || null;

        await db.query(
            `INSERT INTO audit_logs (user_id, username, action, entity, entity_id, details, ip_address, user_agent) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [userId, username, action, entity, entityId, JSON.stringify(details), ipAddress, userAgent]
        );
    } catch (error) {
        // Log error but don't fail the request
        console.error('Audit logging error:', error.message);
    }
}

/**
 * Middleware to automatically log successful requests
 * Usage: Add to routes that need audit logging
 * Example: router.post('/api/sliders', authenticateToken, auditLog('create', 'slider'), createSlider);
 */
function auditLog(action, entity) {
    return async (req, res, next) => {
        // Store original json function
        const originalJson = res.json.bind(res);

        // Override json function to log after successful operation
        res.json = function (data) {
            // Only log if request was successful (status < 400)
            if (res.statusCode < 400) {
                const userId = req.user ? req.user.id : null;
                const entityId = data.id || req.params.id || null;
                const details = {
                    method: req.method,
                    path: req.path,
                    body: req.body,
                    params: req.params
                };

                // Log asynchronously (don't wait)
                logAudit(userId, action, entity, entityId, details, req).catch(err => {
                    console.error('Audit log failed:', err.message);
                });
            }

            // Call original json function
            return originalJson(data);
        };

        next();
    };
}

/**
 * Middleware for logging authentication events
 */
function auditAuth(action) {
    return async (req, res, next) => {
        const originalJson = res.json.bind(res);

        res.json = function (data) {
            if (res.statusCode < 400 && action === 'login') {
                const userId = data.user ? data.user.id : null;
                const username = data.user ? data.user.username : req.body.username;
                
                logAudit(userId, action, 'auth', userId, { username }, req).catch(err => {
                    console.error('Auth audit log failed:', err.message);
                });
            }

            return originalJson(data);
        };

        next();
    };
}

/**
 * Helper to log custom events directly
 */
async function logCustomEvent(req, action, entity, entityId, details) {
    const userId = req.user ? req.user.id : null;
    await logAudit(userId, action, entity, entityId, details, req);
}

module.exports = {
    logAudit,
    auditLog,
    auditAuth,
    logCustomEvent
};
