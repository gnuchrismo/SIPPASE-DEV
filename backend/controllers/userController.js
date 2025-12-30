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
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
    try {
        // Get users with their roles
        const result = await db.query(`
            SELECT 
                u.id, u.username, u.email, u.full_name, u.avatar_url, u.is_active, u.created_at,
                json_agg(
                    json_build_object('id', r.id, 'name', r.name, 'description', r.description)
                ) FILTER (WHERE r.id IS NOT NULL) as roles
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            GROUP BY u.id
            ORDER BY u.id ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createUser = async (req, res) => {
    const { username, email, password, role, full_name, avatar_url } = req.body;
    try {
        await db.query('BEGIN');
        const passwordHash = await bcrypt.hash(password, 10);
        
        const result = await db.query(
            'INSERT INTO users (username, email, password_hash, full_name, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, full_name, avatar_url, is_active, created_at',
            [username, email, passwordHash, full_name, avatar_url]
        );
        const newUser = result.rows[0];

        // Assign role
        const roleName = role || 'editor';
        const roleRes = await db.query('SELECT id FROM roles WHERE name = $1', [roleName]);
        
        if (roleRes.rows.length > 0) {
            const roleId = roleRes.rows[0].id;
            const assignedBy = req.user ? req.user.id : null;
            await db.query(
                'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $3)',
                [newUser.id, roleId, assignedBy]
            );
        }

        await db.query('COMMIT');
        res.status(201).json(newUser);
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, role, is_active, password, full_name, avatar_url } = req.body;

    try {
        await db.query('BEGIN');

        let query = 'UPDATE users SET username = $1, email = $2, is_active = $3, full_name = $4, avatar_url = $5';
        let params = [username, email, is_active, full_name, avatar_url];
        let paramCount = 5;

        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            paramCount++;
            query += `, password_hash = $${paramCount}`;
            params.push(passwordHash);
        } else {
            // Keep existing password
        }

        paramCount++;
        query += ` WHERE id = $${paramCount} RETURNING id, username, email, full_name, avatar_url, is_active`;
        params.push(id);

        const result = await db.query(query, params);
        if (result.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'User not found' });
        }

        // Update role if provided
        if (role) {
            const roleRes = await db.query('SELECT id FROM roles WHERE name = $1', [role]);
            if (roleRes.rows.length > 0) {
                const roleId = roleRes.rows[0].id;
                // Remove existing roles
                await db.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
                
                const assignedBy = req.user ? req.user.id : null;
                await db.query(
                    'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $3)',
                    [id, roleId, assignedBy]
                );
            }
        }

        await db.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Assign roles to a user
 */
exports.assignRoles = async (req, res) => {
    const { id } = req.params;
    const { role_ids } = req.body;

    if (!Array.isArray(role_ids)) {
        return res.status(400).json({ error: 'role_ids must be an array' });
    }

    try {
        // Start transaction
        await db.query('BEGIN');

        // Remove existing roles
        await db.query('DELETE FROM user_roles WHERE user_id = $1', [id]);

        // Add new roles
        const assignedBy = req.user ? req.user.id : null;
        for (const roleId of role_ids) {
            await db.query(
                'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $3)',
                [id, roleId, assignedBy]
            );
        }

        await db.query('COMMIT');

        // Get updated user with roles
        const result = await db.query(`
            SELECT 
                u.id, u.username, u.email,
                json_agg(json_build_object('id', r.id, 'name', r.name)) as roles
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.id = $1
            GROUP BY u.id
        `, [id]);

        res.json(result.rows[0]);
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error assigning roles:', error);
        res.status(500).json({ error: 'Failed to assign roles' });
    }
};

/**
 * Get roles for a specific user
 */
exports.getUserRoles = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(`
            SELECT r.*
            FROM roles r
            INNER JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = $1
            ORDER BY r.name
        `, [id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching user roles:', error);
        res.status(500).json({ error: 'Failed to fetch user roles' });
    }
};
