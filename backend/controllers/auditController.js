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
 * Get audit logs with filtering and pagination
 */
exports.getAuditLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            user_id,
            action,
            entity,
            entity_id,
            start_date,
            end_date,
            search
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = [];
        let params = [];
        let paramCount = 1;

        // Build WHERE conditions dynamically
        if (user_id) {
            whereConditions.push(`user_id = $${paramCount++}`);
            params.push(user_id);
        }

        if (action) {
            whereConditions.push(`action = $${paramCount++}`);
            params.push(action);
        }

        if (entity) {
            whereConditions.push(`entity = $${paramCount++}`);
            params.push(entity);
        }

        if (entity_id) {
            whereConditions.push(`entity_id = $${paramCount++}`);
            params.push(entity_id);
        }

        if (start_date) {
            whereConditions.push(`created_at >= $${paramCount++}`);
            params.push(start_date);
        }

        if (end_date) {
            whereConditions.push(`created_at <= $${paramCount++}`);
            params.push(end_date);
        }

        if (search) {
            whereConditions.push(`(username ILIKE $${paramCount} OR details::text ILIKE $${paramCount})`);
            params.push(`%${search}%`);
            paramCount++;
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM audit_logs ${whereClause}`;
        const countResult = await db.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        // Get paginated results
        params.push(limit, offset);
        const dataQuery = `
            SELECT 
                al.*,
                u.username as user_username,
                u.email as user_email
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ${whereClause}
            ORDER BY al.created_at DESC
            LIMIT $${paramCount++} OFFSET $${paramCount++}
        `;

        const result = await db.query(dataQuery, params);

        res.json({
            logs: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
};

/**
 * Get audit log statistics for dashboard
 */
exports.getAuditStats = async (req, res) => {
    try {
        const { period = '7d' } = req.query;

        // Calculate date range
        const periodMap = {
            '24h': '1 day',
            '7d': '7 days',
            '30d': '30 days',
            '90d': '90 days'
        };

        const interval = periodMap[period] || '7 days';

        // Total logs in period
        const totalQuery = `
            SELECT COUNT(*) as total
            FROM audit_logs
            WHERE created_at >= NOW() - INTERVAL '${interval}'
        `;
        const totalResult = await db.query(totalQuery);

        // Actions breakdown
        const actionsQuery = `
            SELECT action, COUNT(*) as count
            FROM audit_logs
            WHERE created_at >= NOW() - INTERVAL '${interval}'
            GROUP BY action
            ORDER BY count DESC
        `;
        const actionsResult = await db.query(actionsQuery);

        // Entities breakdown
        const entitiesQuery = `
            SELECT entity, COUNT(*) as count
            FROM audit_logs
            WHERE created_at >= NOW() - INTERVAL '${interval}'
            GROUP BY entity
            ORDER BY count DESC
        `;
        const entitiesResult = await db.query(entitiesQuery);

        // Most active users
        const usersQuery = `
            SELECT 
                user_id,
                username,
                COUNT(*) as action_count
            FROM audit_logs
            WHERE created_at >= NOW() - INTERVAL '${interval}' AND user_id IS NOT NULL
            GROUP BY user_id, username
            ORDER BY action_count DESC
            LIMIT 10
        `;
        const usersResult = await db.query(usersQuery);

        // Activity timeline (daily)
        const timelineQuery = `
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM audit_logs
            WHERE created_at >= NOW() - INTERVAL '${interval}'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;
        const timelineResult = await db.query(timelineQuery);

        res.json({
            total: parseInt(totalResult.rows[0].total),
            actions: actionsResult.rows,
            entities: entitiesResult.rows,
            topUsers: usersResult.rows,
            timeline: timelineResult.rows
        });
    } catch (error) {
        console.error('Error fetching audit stats:', error);
        res.status(500).json({ error: 'Failed to fetch audit statistics' });
    }
};

/**
 * Export audit logs as CSV or JSON
 */
exports.exportAuditLogs = async (req, res) => {
    try {
        const { format = 'csv', ...filters } = req.query;

        // Build query similar to getAuditLogs but without pagination
        let whereConditions = [];
        let params = [];
        let paramCount = 1;

        if (filters.user_id) {
            whereConditions.push(`user_id = $${paramCount++}`);
            params.push(filters.user_id);
        }

        if (filters.action) {
            whereConditions.push(`action = $${paramCount++}`);
            params.push(filters.action);
        }

        if (filters.entity) {
            whereConditions.push(`entity = $${paramCount++}`);
            params.push(filters.entity);
        }

        if (filters.start_date) {
            whereConditions.push(`created_at >= $${paramCount++}`);
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            whereConditions.push(`created_at <= $${paramCount++}`);
            params.push(filters.end_date);
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        const query = `
            SELECT 
                al.id,
                al.username,
                al.action,
                al.entity,
                al.entity_id,
                al.details,
                al.ip_address,
                al.created_at
            FROM audit_logs al
            ${whereClause}
            ORDER BY al.created_at DESC
            LIMIT 10000
        `;

        const result = await db.query(query, params);

        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.json`);
            res.json(result.rows);
        } else {
            // CSV format
            const csvHeader = 'ID,Username,Action,Entity,Entity ID,IP Address,Timestamp,Details\n';
            const csvRows = result.rows.map(row => {
                const details = JSON.stringify(row.details).replace(/"/g, '""');
                return `${row.id},"${row.username || 'N/A'}","${row.action}","${row.entity || 'N/A'}",${row.entity_id || ''},"${row.ip_address}","${row.created_at}","${details}"`;
            }).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
            res.send(csvHeader + csvRows);
        }
    } catch (error) {
        console.error('Error exporting audit logs:', error);
        res.status(500).json({ error: 'Failed to export audit logs' });
    }
};

/**
 * Clean old audit logs based on retention policy
 */
exports.cleanOldLogs = async (req, res) => {
    try {
        // Get retention policy
        const policyResult = await db.query('SELECT retention_days FROM audit_log_retention LIMIT 1');
        const retentionDays = policyResult.rows[0]?.retention_days || 90;

        // Delete old logs
        const deleteQuery = `
            DELETE FROM audit_logs
            WHERE created_at < NOW() - INTERVAL '${retentionDays} days'
        `;
        const result = await db.query(deleteQuery);

        // Update last cleanup time
        await db.query('UPDATE audit_log_retention SET last_cleanup_at = NOW()');

        res.json({
            message: 'Old logs cleaned successfully',
            deletedCount: result.rowCount,
            retentionDays
        });
    } catch (error) {
        console.error('Error cleaning old logs:', error);
        res.status(500).json({ error: 'Failed to clean old logs' });
    }
};

/**
 * Get/Update retention policy
 */
exports.getRetentionPolicy = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM audit_log_retention LIMIT 1');
        res.json(result.rows[0] || { retention_days: 90, auto_cleanup_enabled: true });
    } catch (error) {
        console.error('Error fetching retention policy:', error);
        res.status(500).json({ error: 'Failed to fetch retention policy' });
    }
};

exports.updateRetentionPolicy = async (req, res) => {
    try {
        const { retention_days, auto_cleanup_enabled } = req.body;

        const result = await db.query(
            `UPDATE audit_log_retention 
             SET retention_days = $1, auto_cleanup_enabled = $2, updated_at = NOW()
             RETURNING *`,
            [retention_days, auto_cleanup_enabled]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating retention policy:', error);
        res.status(500).json({ error: 'Failed to update retention policy' });
    }
};

/**
 * Get unique values for filters (users, actions, entities)
 */
exports.getFilterOptions = async (req, res) => {
    try {
        // Get users who have audit logs
        const usersQuery = `
            SELECT DISTINCT user_id, username
            FROM audit_logs
            WHERE user_id IS NOT NULL
            ORDER BY username
        `;
        const users = await db.query(usersQuery);

        // Get distinct actions
        const actionsQuery = `
            SELECT DISTINCT action
            FROM audit_logs
            ORDER BY action
        `;
        const actions = await db.query(actionsQuery);

        // Get distinct entities
        const entitiesQuery = `
            SELECT DISTINCT entity
            FROM audit_logs
            WHERE entity IS NOT NULL
            ORDER BY entity
        `;
        const entities = await db.query(entitiesQuery);

        res.json({
            users: users.rows,
            actions: actions.rows.map(r => r.action),
            entities: entities.rows.map(r => r.entity)
        });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ error: 'Failed to fetch filter options' });
    }
};
