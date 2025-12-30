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
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(401);
        req.user = user;
        next();
    });
};

/**
 * Legacy role-based authorization (kept for backwards compatibility)
 */
exports.authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
};

/**
 * Granular permission-based authorization
 * @param {string} permission - Permission name (e.g., 'sliders.create', 'users.delete')
 */
exports.checkPermission = (permission) => {
    return async (req, res, next) => {
        try {
            console.log('Checking permission:', permission);
            console.log('User:', req.user);

            if (!req.user) {
                console.log('No user found in request');
                return res.status(401).json({ error: 'Authentication required' });
            }

            const userId = req.user.id;

            // Check if user has the required permission through their roles
            const result = await db.query(`
                SELECT EXISTS (
                    SELECT 1
                    FROM user_roles ur
                    INNER JOIN role_permissions rp ON ur.role_id = rp.role_id
                    INNER JOIN permissions p ON rp.permission_id = p.id
                    WHERE ur.user_id = $1 AND p.name = $2
                ) as has_permission
            `, [userId, permission]);

            // DEBUG LOGGING
            try {
                const fs = require('fs');
                const path = require('path');
                const logPath = path.join(__dirname, '../debug_auth_log.txt');
                const logData = `[${new Date().toISOString()}] Permission: ${permission}, UserID: ${userId}, Result: ${JSON.stringify(result.rows[0])}\n`;
                fs.appendFileSync(logPath, logData);
            } catch (e) { console.error('Log failed', e); }

            console.log('Permission check result:', result.rows[0]);

            if (!result.rows[0].has_permission) {
                console.log('Permission denied');
                return res.status(403).json({
                    error: 'Insufficient permissions',
                    required: permission
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ error: 'Permission check failed' });
        }
    };
};

/**
 * Check if user has ANY of the specified permissions
 * @param {string[]} permissions - Array of permission names
 */
exports.checkAnyPermission = (permissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const userId = req.user.id;

            // Check if user has any of the required permissions
            const result = await db.query(`
                SELECT EXISTS (
                    SELECT 1
                    FROM user_roles ur
                    INNER JOIN role_permissions rp ON ur.role_id = rp.role_id
                    INNER JOIN permissions p ON rp.permission_id = p.id
                    WHERE ur.user_id = $1 AND p.name = ANY($2)
                ) as has_permission
            `, [userId, permissions]);

            if (!result.rows[0].has_permission) {
                return res.status(403).json({ 
                    error: 'Insufficient permissions',
                    required_any: permissions 
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ error: 'Permission check failed' });
        }
    };
};

/**
 * Check if user has ALL of the specified permissions
 * @param {string[]} permissions - Array of permission names
 */
exports.checkAllPermissions = (permissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const userId = req.user.id;

            // Check each permission one by one
            for (const permission of permissions) {
                const result = await db.query(`
                    SELECT EXISTS (
                        SELECT 1
                        FROM user_roles ur
                        INNER JOIN role_permissions rp ON ur.role_id = rp.role_id
                        INNER JOIN permissions p ON rp.permission_id = p.id
                        WHERE ur.user_id = $1 AND p.name = $2
                    ) as has_permission
                `, [userId, permission]);

                if (!result.rows[0].has_permission) {
                    return res.status(403).json({ 
                        error: 'Insufficient permissions',
                        required_all: permissions,
                        missing: permission
                    });
                }
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ error: 'Permission check failed' });
        }
    };
};
