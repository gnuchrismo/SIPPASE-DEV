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
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

exports.getSettings = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM site_settings');
        // Convert array to object for easier frontend consumption
        const settings = result.rows.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateSettings = async (req, res) => {
    const settings = req.body; // Expecting object { key: value, key2: value2 }

    try {
        const keys = Object.keys(settings);
        
        // Use a transaction for atomicity
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            for (const key of keys) {
                const value = settings[key];
                // Upsert logic
                await client.query(
                    `INSERT INTO site_settings (key, value, updated_at) 
                     VALUES ($1, $2, NOW()) 
                     ON CONFLICT (key) 
                     DO UPDATE SET value = $2, updated_at = NOW()`,
                    [key, value]
                );
            }

            await client.query('COMMIT');
            
            // Audit Log
            await logAudit(req.user.id, 'update', 'settings', null, settings, req);

            res.json({ message: 'Settings updated successfully' });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateFavicon = async (req, res) => {
    const { faviconUrl } = req.body;

    if (!faviconUrl) {
        return res.status(400).json({ error: 'Favicon URL is required' });
    }

    try {
        // Determine if URL is local or external
        let sourcePath;
        
        if (faviconUrl.startsWith('http://localhost') || faviconUrl.startsWith('/uploads')) {
            // Local file
            sourcePath = faviconUrl.replace('http://localhost:3000', '');
            sourcePath = path.join(__dirname, '../../', sourcePath);
        } else if (faviconUrl.startsWith('http')) {
            // External URL - download first
            const tempPath = path.join(__dirname, '../../temp_favicon.png');
            await downloadFile(faviconUrl, tempPath);
            sourcePath = tempPath;
        } else {
            // Relative path
            sourcePath = path.join(__dirname, '../../', faviconUrl);
        }

        // Destination paths
        const clientPublicDir = path.join(__dirname, '../../client/public');
        const faviconIcoPath = path.join(clientPublicDir, 'favicon.ico');
        const faviconPngPath = path.join(clientPublicDir, 'favicon.png');

        // Ensure public directory exists
        await fs.mkdir(clientPublicDir, { recursive: true });

        // Copy file to both .ico and .png (browsers support both)
        await fs.copyFile(sourcePath, faviconPngPath);
        await fs.copyFile(sourcePath, faviconIcoPath);

        // Update index.html to reference the favicon
        const indexHtmlPath = path.join(__dirname, '../../client/index.html');
        let indexHtml = await fs.readFile(indexHtmlPath, 'utf8');
        
        // Update or add favicon links
        if (!indexHtml.includes('rel="icon"')) {
            indexHtml = indexHtml.replace(
                '</head>',
                '    <link rel="icon" type="image/png" href="/favicon.png" />\n    <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />\n  </head>'
            );
        }
        
        await fs.writeFile(indexHtmlPath, indexHtml);

        // Update settings in database
        await db.query(
            `INSERT INTO site_settings (key, value, updated_at) 
             VALUES ('favicon_url', $1, NOW()) 
             ON CONFLICT (key) 
             DO UPDATE SET value = $1, updated_at = NOW()`,
            [faviconUrl]
        );

        // Audit log
        await logAudit(req.user.id, 'update', 'favicon', null, { faviconUrl }, req);

        res.json({ 
            message: 'Favicon updated successfully',
            faviconUrl: '/favicon.ico'
        });
    } catch (err) {
        console.error('Error updating favicon:', err);
        res.status(500).json({ error: 'Failed to update favicon', details: err.message });
    }
};

// Helper function to download files
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = require('fs').createWriteStream(dest);
        
        protocol.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            require('fs').unlink(dest, () => {});
            reject(err);
        });
    });
}
