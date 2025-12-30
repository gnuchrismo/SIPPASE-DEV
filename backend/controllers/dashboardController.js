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

exports.getStats = async (req, res) => {
    try {
        const [sliders, systems, documents, users, messages] = await Promise.all([
            db.query('SELECT COUNT(*) FROM sliders'),
            db.query('SELECT COUNT(*) FROM systems'),
            db.query('SELECT COUNT(*) FROM documents'),
            db.query('SELECT COUNT(*) FROM users'),
            db.query('SELECT COUNT(*) FROM contact_messages')
        ]);

        res.json({
            sliders: parseInt(sliders.rows[0].count),
            systems: parseInt(systems.rows[0].count),
            documents: parseInt(documents.rows[0].count),
            users: parseInt(users.rows[0].count),
            messages: parseInt(messages.rows[0].count)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getActivity = async (req, res) => {
    try {
        // Fetch recent items from each table
        const [sliders, systems, documents, users, messages] = await Promise.all([
            db.query("SELECT id, title as name, 'slider' as type, created_at FROM sliders ORDER BY created_at DESC LIMIT 5"),
            db.query("SELECT id, name, 'system' as type, created_at FROM systems ORDER BY created_at DESC LIMIT 5"),
            db.query("SELECT id, title as name, 'document' as type, created_at FROM documents ORDER BY created_at DESC LIMIT 5"),
            db.query("SELECT id, username as name, 'user' as type, created_at FROM users ORDER BY created_at DESC LIMIT 5"),
            db.query("SELECT id, name, 'message' as type, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 5")
        ]);

        const activity = [
            ...sliders.rows,
            ...systems.rows,
            ...documents.rows,
            ...users.rows,
            ...messages.rows
        ];

        // Sort by created_at desc
        activity.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Return top 10
        res.json(activity.slice(0, 10));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getChartData = async (req, res) => {
    try {
        // Get activity counts for the last 30 days
        // This is a bit complex with raw SQL across multiple tables. 
        // For now, let's just return document uploads and messages as they are the most "activity" like.
        
        const days = 30;
        
        const documents = await db.query(`
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM documents 
            WHERE created_at > NOW() - INTERVAL '${days} days' 
            GROUP BY DATE(created_at) 
            ORDER BY DATE(created_at)
        `);

        const messages = await db.query(`
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM contact_messages 
            WHERE created_at > NOW() - INTERVAL '${days} days' 
            GROUP BY DATE(created_at) 
            ORDER BY DATE(created_at)
        `);

        res.json({
            documents: documents.rows,
            messages: messages.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
