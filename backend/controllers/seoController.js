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
const { logAudit } = require('../middleware/auditMiddleware');

exports.getSeoSettings = async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM site_settings WHERE key LIKE 'seo_%'");
        const settings = result.rows.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        // Provide defaults if not set
        const defaults = {
            seo_title_default: 'Sippase Portal',
            seo_title_template: '%s | Sippase',
            seo_description_default: 'Bienvenido al portal Sippase.',
            seo_keywords_default: 'sippase, portal, bus',
            seo_og_image: '',
            seo_robots_txt: 'User-agent: *\nAllow: /'
        };

        res.json({ ...defaults, ...settings });
    } catch (err) {
        console.error('Error fetching SEO settings:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateSeoSettings = async (req, res) => {
    const settings = req.body;
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        for (const [key, value] of Object.entries(settings)) {
            if (key.startsWith('seo_')) {
                await client.query(
                    `INSERT INTO site_settings (key, value, updated_at) 
                     VALUES ($1, $2, NOW()) 
                     ON CONFLICT (key) 
                     DO UPDATE SET value = $2, updated_at = NOW()`,
                    [key, value]
                );
            }
        }

        await client.query('COMMIT');
        await logAudit(req.user.id, 'update', 'seo_settings', null, settings, req);
        res.json({ message: 'SEO settings updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating SEO settings:', err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
};

exports.getRobotsTxt = async (req, res) => {
    try {
        const result = await db.query("SELECT value FROM site_settings WHERE key = 'seo_robots_txt'");
        const content = result.rows.length > 0 ? result.rows[0].value : 'User-agent: *\nAllow: /';
        
        res.header('Content-Type', 'text/plain');
        res.send(content);
    } catch (err) {
        console.error('Error fetching robots.txt:', err);
        res.status(500).send('User-agent: *\nAllow: /');
    }
};
