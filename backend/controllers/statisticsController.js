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

// Get all statistics
exports.getAllStatistics = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM statistics ORDER BY category, display_order ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get statistics by category
exports.getStatisticsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const result = await db.query(
            'SELECT * FROM statistics WHERE category = $1 ORDER BY display_order ASC',
            [category]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single statistic
exports.getStatistic = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM statistics WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Statistic not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create new statistic
exports.createStatistic = async (req, res) => {
    const { category, label, value, period, display_order } = req.body;

    if (!category || !label || value === undefined) {
        return res.status(400).json({ error: 'Category, label, and value are required' });
    }

    try {
        const result = await db.query(
            'INSERT INTO statistics (category, label, value, period, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [category, label, value, period, display_order || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update statistic
exports.updateStatistic = async (req, res) => {
    const { id } = req.params;
    const { category, label, value, period, display_order } = req.body;

    try {
        const current = await db.query('SELECT * FROM statistics WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'Statistic not found' });
        }

        const result = await db.query(
            'UPDATE statistics SET category = $1, label = $2, value = $3, period = $4, display_order = $5 WHERE id = $6 RETURNING *',
            [category, label, value, period, display_order, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete statistic
exports.deleteStatistic = async (req, res) => {
    const { id } = req.params;
    try {
        const current = await db.query('SELECT * FROM statistics WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'Statistic not found' });
        }

        await db.query('DELETE FROM statistics WHERE id = $1', [id]);
        res.json({ message: 'Statistic deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Bulk create statistics (for CSV/Excel import)
exports.bulkCreateStatistics = async (req, res) => {
    const { statistics } = req.body; // Array of statistics objects

    if (!Array.isArray(statistics) || statistics.length === 0) {
        return res.status(400).json({ error: 'Statistics array is required and must not be empty' });
    }

    console.log(`📊 Bulk import request: ${statistics.length} items`);

    try {
        const results = [];
        const errors = [];
        
        for (let i = 0; i < statistics.length; i++) {
            const stat = statistics[i];
            const { category, label, value, period, display_order } = stat;
            
            // Validate required fields
            if (!category || !label || value === undefined || value === null) {
                const error = `Row ${i + 1}: Missing required fields (category: ${category}, label: ${label}, value: ${value})`;
                console.error('❌', error);
                errors.push(error);
                continue;
            }

            // Ensure value is a number
            const numericValue = Number(value);
            if (isNaN(numericValue)) {
                const error = `Row ${i + 1}: Invalid value "${value}" - must be a number`;
                console.error('❌', error);
                errors.push(error);
                continue;
            }

            try {
                const result = await db.query(
                    'INSERT INTO statistics (category, label, value, period, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [
                        category, 
                        label, 
                        numericValue, 
                        period || null, 
                        display_order !== undefined && display_order !== null ? Number(display_order) : 0
                    ]
                );
                results.push(result.rows[0]);
                console.log(`✅ Row ${i + 1} imported:`, result.rows[0]);
            } catch (dbError) {
                const error = `Row ${i + 1}: Database error - ${dbError.message}`;
                console.error('❌', error);
                errors.push(error);
            }
        }

        if (results.length === 0 && errors.length > 0) {
            return res.status(400).json({ 
                error: 'No statistics were imported',
                details: errors.join('; '),
                errors: errors
            });
        }

        const response = {
            message: `${results.length} statistics created successfully`,
            data: results
        };

        if (errors.length > 0) {
            response.warnings = errors;
            response.message += ` (${errors.length} failed)`;
        }

        console.log(`✅ Bulk import completed: ${results.length} success, ${errors.length} errors`);
        res.status(201).json(response);
        
    } catch (err) {
        console.error('❌ Bulk import fatal error:', err);
        res.status(500).json({ 
            error: 'Server error during bulk creation',
            details: err.message
        });
    }
};

// Get statistics summary (for dashboard)
exports.getStatisticsSummary = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                category,
                COUNT(*) as count,
                SUM(value) as total
            FROM statistics
            GROUP BY category
            ORDER BY category
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
