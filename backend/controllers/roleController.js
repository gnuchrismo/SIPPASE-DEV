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
 * Get all roles
 */
exports.getAllRoles = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT r.*, 
                   COUNT(DISTINCT ur.user_id) as user_count,
                   COUNT(DISTINCT rp.permission_id) as permission_count
            FROM roles r
            LEFT JOIN user_roles ur ON r.id = ur.role_id
            LEFT JOIN role_permissions rp ON r.id = rp.role_id
            GROUP BY r.id
            ORDER BY r.is_system_role DESC, r.name ASC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
};

/**
 * Get single role by ID
 */
exports.getRoleById = async (req, res) => {
    try {
        const { id } = req.params;

        const roleResult = await db.query('SELECT * FROM roles WHERE id = $1', [id]);
        
        if (roleResult.rows.length === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }

        res.json(roleResult.rows[0]);
    } catch (error) {
        console.error('Error fetching role:', error);
        res.status(500).json({ error: 'Failed to fetch role' });
    }
};

/**
 * Create new role
 */
exports.createRole = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({ error: 'Role name is required' });
        }

        const result = await db.query(
            `INSERT INTO roles (name, description, is_system_role) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [name, description, false]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'Role name already exists' });
        }
        console.error('Error creating role:', error);
        res.status(500).json({ error: 'Failed to create role' });
    }
};

/**
 * Update role
 */
exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        // Check if role exists
        const checkResult = await db.query('SELECT is_system_role FROM roles WHERE id = $1', [id]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }

        // Prevent modification of system role names
        if (checkResult.rows[0].is_system_role && name) {
            return res.status(403).json({ error: 'Cannot change name of system role' });
        }

        const result = await db.query(
            `UPDATE roles 
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 updated_at = NOW()
             WHERE id = $3
             RETURNING *`,
            [name, description, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Role name already exists' });
        }
        console.error('Error updating role:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
};

/**
 * Delete role
 */
exports.deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if role exists and is not a system role
        const checkResult = await db.query('SELECT is_system_role FROM roles WHERE id = $1', [id]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }

        if (checkResult.rows[0].is_system_role) {
            return res.status(403).json({ error: 'Cannot delete system role' });
        }

        await db.query('DELETE FROM roles WHERE id = $1', [id]);

        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ error: 'Failed to delete role' });
    }
};

/**
 * Get permissions for a role
 */
exports.getRolePermissions = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(`
            SELECT p.*
            FROM permissions p
            INNER JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = $1
            ORDER BY p.module, p.action
        `, [id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching role permissions:', error);
        res.status(500).json({ error: 'Failed to fetch role permissions' });
    }
};

/**
 * Update permissions for a role
 */
exports.updateRolePermissions = async (req, res) => {
    try {
        const { id } = req.params;
        const { permission_ids } = req.body;

        if (!Array.isArray(permission_ids)) {
            return res.status(400).json({ error: 'permission_ids must be an array' });
        }

        // Start transaction
        await db.query('BEGIN');

        try {
            // Remove existing permissions
            await db.query('DELETE FROM role_permissions WHERE role_id = $1', [id]);

            // Add new permissions
            for (const permissionId of permission_ids) {
                await db.query(
                    'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
                    [id, permissionId]
                );
            }

            await db.query('COMMIT');

            // Fetch updated permissions
            const result = await db.query(`
                SELECT p.*
                FROM permissions p
                INNER JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = $1
                ORDER BY p.module, p.action
            `, [id]);

            res.json(result.rows);
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error updating role permissions:', error);
        res.status(500).json({ error: 'Failed to update role permissions' });
    }
};

/**
 * Get users assigned to a role
 */
exports.getRoleUsers = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(`
            SELECT u.id, u.username, u.email, ur.assigned_at
            FROM users u
            INNER JOIN user_roles ur ON u.id = ur.user_id
            WHERE ur.role_id = $1
            ORDER BY u.username
        `, [id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching role users:', error);
        res.status(500).json({ error: 'Failed to fetch role users' });
    }
};
