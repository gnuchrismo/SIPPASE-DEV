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
const { logAudit } = require('../middleware/auditMiddleware');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/sliders');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'slider-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

exports.getAllSliders = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sliders ORDER BY display_order ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getSlider = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM sliders WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Slider not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createSlider = async (req, res) => {
    console.log('📝 Create Slider Request Body:', req.body);
    console.log('📁 Create Slider File:', req.file);

    const { title, description, link_url, display_order, is_active } = req.body;
    const image_url = req.file ? `/uploads/sliders/${req.file.filename}` : null;

    if (!image_url) {
        return res.status(400).json({ error: 'Image is required' });
    }

    try {
        // Robust boolean conversion
        const isActive = String(is_active) !== 'false';

        const result = await db.query(
            'INSERT INTO sliders (title, description, image_url, link_url, display_order, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, image_url, link_url, display_order || 0, isActive]
        );

        // Audit Log
        if (req.user && req.user.id) {
            await logAudit(req.user.id, 'create', 'slider', result.rows[0].id, req.body, req);
        } else {
            console.warn('⚠️ Audit log skipped: No user ID found in request');
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('❌ Create Slider Error:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
};

exports.updateSlider = async (req, res) => {
    const { id } = req.params;
    console.log('📝 Update Slider ID:', id);
    console.log('📝 Update Slider Body:', req.body);
    
    // Handle potential undefined values
    const { title, display_order } = req.body;
    const description = req.body.description || '';
    const link_url = req.body.link_url || '';
    const is_active = req.body.is_active;

    try {
        // Get current slider to check if exists and get old image
        const current = await db.query('SELECT * FROM sliders WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'Slider not found' });
        }

        const image_url = req.file ? `/uploads/sliders/${req.file.filename}` : current.rows[0].image_url;

        // If new image uploaded, delete old one
        if (req.file && current.rows[0].image_url && current.rows[0].image_url.startsWith('/uploads')) {
            const oldImagePath = path.join(__dirname, '..', current.rows[0].image_url);
            try {
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            } catch (fileError) {
                console.error('⚠️ Failed to delete old image:', fileError.message);
                // Continue execution even if file deletion fails
            }
        }

        // Robust boolean conversion
        const isActive = String(is_active) !== 'false';

        const result = await db.query(
            'UPDATE sliders SET title = $1, description = $2, image_url = $3, link_url = $4, display_order = $5, is_active = $6 WHERE id = $7 RETURNING *',
            [title, description, image_url, link_url, display_order, isActive, id]
        );

        // Audit Log - Safe access to user id
        if (req.user && req.user.id) {
            try {
                await logAudit(req.user.id, 'update', 'slider', id, req.body, req);
            } catch (auditError) {
                console.error('⚠️ Audit log failed:', auditError.message);
            }
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Update Slider Error:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
};

exports.deleteSlider = async (req, res) => {
    const { id } = req.params;
    try {
        const current = await db.query('SELECT * FROM sliders WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'Slider not found' });
        }

        // Delete image file if exists
        if (current.rows[0].image_url && current.rows[0].image_url.startsWith('/uploads')) {
            const imagePath = path.join(__dirname, '..', current.rows[0].image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await db.query('DELETE FROM sliders WHERE id = $1', [id]);

        // Audit Log
        await logAudit(req.user.id, 'delete', 'slider', id, { title: current.rows[0].title }, req);

        res.json({ message: 'Slider deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.reorderSliders = async (req, res) => {
    const { sliders } = req.body; // Array of { id, display_order }

    try {
        for (const slider of sliders) {
            await db.query('UPDATE sliders SET display_order = $1 WHERE id = $2', [slider.display_order, slider.id]);
        }
        
        // Audit Log
        await logAudit(req.user.id, 'reorder', 'slider', null, { count: sliders.length }, req);

        res.json({ message: 'Sliders reordered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
