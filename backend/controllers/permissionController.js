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
 * Get all permissions grouped by module
 */
exports.getAllPermissions = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT * FROM permissions
            ORDER BY module, action
        `);

        // Group by module
        const groupedPermissions = result.rows.reduce((acc, perm) => {
            if (!acc[perm.module]) {
                acc[perm.module] = [];
            }
            acc[perm.module].push(perm);
            return acc;
        }, {});

        res.json({
            all: result.rows,
            grouped: groupedPermissions
        });
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ error: 'Failed to fetch permissions' });
    }
};

/**
 * Check if user has a specific permission
 */
exports.checkPermission = async (req, res) => {
    try {
        const { permission } = req.query;
        const userId = req.user.id;

        if (!permission) {
            return res.status(400).json({ error: 'Permission parameter required' });
        }

        const result = await db.query(`
            SELECT EXISTS (
                SELECT 1
                FROM user_roles ur
                INNER JOIN role_permissions rp ON ur.role_id = rp.role_id
                INNER JOIN permissions p ON rp.permission_id = p.id
                WHERE ur.user_id = $1 AND p.name = $2
            ) as has_permission
        `, [userId, permission]);

        res.json({ hasPermission: result.rows[0].has_permission });
    } catch (error) {
        console.error('Error checking permission:', error);
        res.status(500).json({ error: 'Failed to check permission' });
    }
};

/**
 * Get all permissions for current user
 */
exports.getUserPermissions = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(`
            SELECT DISTINCT p.*
            FROM permissions p
            INNER JOIN role_permissions rp ON p.id = rp.permission_id
            INNER JOIN user_roles ur ON rp.role_id = ur.role_id
            WHERE ur.user_id = $1
            ORDER BY p.module, p.action
        `, [userId]);

        // Return as array of permission names for easy checking
        const permissionNames = result.rows.map(p => p.name);

        res.json({
            permissions: result.rows,
            permissionNames
        });
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        res.status(500).json({ error: 'Failed to fetch user permissions' });
    }
};
