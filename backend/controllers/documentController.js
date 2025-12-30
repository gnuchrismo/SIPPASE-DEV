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

// Configure multer for document uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/documents');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, 'doc-' + uniqueSuffix + '-' + sanitizedName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|xls|xlsx|zip/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten documentos (pdf, doc, docx, xls, xlsx, zip)'));
        }
    }
});

exports.upload = upload;

exports.getAllDocuments = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM documents ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getDocumentsByCategory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        // Get active categories with their display order
        const categoriesResult = await db.query(
            'SELECT name FROM document_categories WHERE is_active = true ORDER BY display_order ASC'
        );
        
        const categories = categoriesResult.rows.map(row => row.name);
        const documentsByCategory = {};
        
        // Get documents for each category
        for (const category of categories) {
            const result = await db.query(
                'SELECT * FROM documents WHERE category = $1 ORDER BY created_at DESC LIMIT $2',
                [category, limit]
            );
            documentsByCategory[category] = result.rows;
        }
        
        res.json(documentsByCategory);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getDocument = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM documents WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createDocument = async (req, res) => {
    const { title, description, category } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'File is required' });
    }

    const file_url = `/uploads/documents/${req.file.filename}`;
    const file_type = path.extname(req.file.originalname).substring(1).toUpperCase();
    const file_size = (req.file.size / 1024).toFixed(2) + ' KB';

    try {
        const result = await db.query(
            'INSERT INTO documents (title, description, file_url, file_type, file_size, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, file_url, file_type, file_size, category]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateDocument = async (req, res) => {
    const { id } = req.params;
    const { title, description, category } = req.body;

    try {
        const current = await db.query('SELECT * FROM documents WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        let file_url = current.rows[0].file_url;
        let file_type = current.rows[0].file_type;
        let file_size = current.rows[0].file_size;

        if (req.file) {
            // Delete old file
            if (current.rows[0].file_url) {
                const oldFilePath = path.join(__dirname, '..', current.rows[0].file_url);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            file_url = `/uploads/documents/${req.file.filename}`;
            file_type = path.extname(req.file.originalname).substring(1).toUpperCase();
            file_size = (req.file.size / 1024).toFixed(2) + ' KB';
        }

        const result = await db.query(
            'UPDATE documents SET title = $1, description = $2, file_url = $3, file_type = $4, file_size = $5, category = $6 WHERE id = $7 RETURNING *',
            [title, description, file_url, file_type, file_size, category, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteDocument = async (req, res) => {
    const { id } = req.params;
    try {
        const current = await db.query('SELECT * FROM documents WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Delete file
        if (current.rows[0].file_url) {
            const filePath = path.join(__dirname, '..', current.rows[0].file_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.query('DELETE FROM documents WHERE id = $1', [id]);
        res.json({ message: 'Document deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
