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
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for icon uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/systems');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'system-icon-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, svg)'));
        }
    }
});

exports.upload = upload;

// Get all systems
exports.getAllSystems = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM systems ORDER BY display_order ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single system
exports.getSystem = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM systems WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'System not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create new system
exports.createSystem = async (req, res) => {
    const { name, description, url, manual_url, display_order, is_active } = req.body;
    const icon_url = req.file ? `/uploads/systems/${req.file.filename}` : null;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        // Convert is_active to boolean (FormData sends strings)
        const isActiveBoolean = is_active === 'true' || is_active === true || is_active === undefined;
        
        // Handle null/undefined values for optional fields
        const descriptionValue = description || null;
        const urlValue = url || null;
        const manualUrlValue = manual_url || null;
        const displayOrderValue = display_order !== undefined && display_order !== null && display_order !== '' 
            ? parseInt(display_order) 
            : 0;
        
        const result = await db.query(
            'INSERT INTO systems (name, description, icon_url, url, manual_url, display_order, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, descriptionValue, icon_url, urlValue, manualUrlValue, displayOrderValue, isActiveBoolean]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating system:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// Update system
exports.updateSystem = async (req, res) => {
    const { id } = req.params;
    const { name, description, url, manual_url, display_order, is_active } = req.body;

    try {
        // Validate required fields
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        // Get current system to check if exists and get old icon
        const current = await db.query('SELECT * FROM systems WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'System not found' });
        }

        const icon_url = req.file ? `/uploads/systems/${req.file.filename}` : current.rows[0].icon_url;
        
        // Convert is_active to boolean (FormData sends strings)
        const isActiveBoolean = is_active === 'true' || is_active === true;

        // Handle null/undefined values for optional fields
        const descriptionValue = description || null;
        const urlValue = url || null;
        const manualUrlValue = manual_url || null;
        const displayOrderValue = display_order !== undefined && display_order !== null && display_order !== '' 
            ? parseInt(display_order) 
            : current.rows[0].display_order;

        // If new icon uploaded, delete old one
        if (req.file && current.rows[0].icon_url && current.rows[0].icon_url.startsWith('/uploads')) {
            const oldIconPath = path.join(__dirname, '..', current.rows[0].icon_url);
            if (fs.existsSync(oldIconPath)) {
                fs.unlinkSync(oldIconPath);
            }
        }

        const result = await db.query(
            'UPDATE systems SET name = $1, description = $2, icon_url = $3, url = $4, manual_url = $5, display_order = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
            [name, descriptionValue, icon_url, urlValue, manualUrlValue, displayOrderValue, isActiveBoolean, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating system:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// Delete system
exports.deleteSystem = async (req, res) => {
    const { id } = req.params;
    try {
        const current = await db.query('SELECT * FROM systems WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'System not found' });
        }

        // Delete icon file if exists
        if (current.rows[0].icon_url && current.rows[0].icon_url.startsWith('/uploads')) {
            const iconPath = path.join(__dirname, '..', current.rows[0].icon_url);
            if (fs.existsSync(iconPath)) {
                fs.unlinkSync(iconPath);
            }
        }

        await db.query('DELETE FROM systems WHERE id = $1', [id]);
        res.json({ message: 'System deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Reorder systems
exports.reorderSystems = async (req, res) => {
    const { systems } = req.body; // Array of { id, display_order }

    try {
        for (const system of systems) {
            await db.query('UPDATE systems SET display_order = $1 WHERE id = $2', [system.display_order, system.id]);
        }
        res.json({ message: 'Systems reordered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
