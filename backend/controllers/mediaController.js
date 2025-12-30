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

// Configure multer for media uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/media');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Sanitize filename - remove special characters and spaces
        const sanitizedName = file.originalname
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .replace(/_+/g, '_')
            .toLowerCase();
        cb(null, 'media-' + uniqueSuffix + '-' + sanitizedName);
    }
});

// Size limits by file type (in bytes)
const FILE_SIZE_LIMITS = {
    image: 10 * 1024 * 1024,      // 10MB for images
    video: 1024 * 1024 * 1024,    // 1GB for videos
    audio: 20 * 1024 * 1024,      // 20MB for audio
    document: 50 * 1024 * 1024,   // 50MB for documents
    default: 50 * 1024 * 1024     // 50MB default
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 1024 }, // Global 1GB limit
    fileFilter: (req, file, cb) => {
        // Enhanced file type validation
        const allowedMimeTypes = [
            // Images
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp',
            // Documents
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            // Archives
            'application/zip', 'application/x-zip-compressed',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
            // Media
            'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo',
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'
        ];

        const allowedExtensions = /jpeg|jpg|png|gif|svg|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|mp4|mpeg|mov|avi|mp3|wav|ogg/;
        const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedMimeTypes.includes(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Extensión: ${path.extname(file.originalname)}`));
        }
    }
});

exports.uploadMiddleware = upload.single('file');

exports.uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const { folder = 'default' } = req.body;
    
    // Validate folder name
    if (!/^[a-zA-Z0-9_-]+$/.test(folder)) {
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ error: 'Nombre de carpeta inválido. Use solo letras, números, guiones y guiones bajos.' });
    }

    const filename = req.file.filename;
    const original_name = req.file.originalname;
    const mime_type = req.file.mimetype;
    const size = req.file.size;
    const filePath = `/uploads/media/${filename}`;

    try {
        // Ensure folder exists in media_folders table
        await db.query(
            'INSERT INTO media_folders (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
            [folder]
        );

        const result = await db.query(
            'INSERT INTO media_files (filename, original_name, mime_type, size, path, folder) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [filename, original_name, mime_type, size, filePath, folder]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error saving file to database:', err);
        // Clean up file if DB insert fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Error al guardar el archivo en la base de datos' });
    }
};

exports.getFiles = async (req, res) => {
    try {
        const { folder, type, search, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
        
        // Validate pagination parameters
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page
        const offset = (pageNum - 1) * limitNum;

        // Validate sort parameters
        const allowedSortFields = ['created_at', 'original_name', 'size', 'mime_type'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
        const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        let query = 'SELECT * FROM media_files';
        const params = [];
        const conditions = [];

        if (folder) {
            params.push(folder);
            conditions.push(`folder = $${params.length}`);
        }

        if (type) {
            params.push(`${type}%`);
            conditions.push(`mime_type LIKE $${params.length}`);
        }

        if (search) {
            params.push(`%${search}%`);
            conditions.push(`original_name ILIKE $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Get total count
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
        const countResult = await db.query(countQuery, params);
        const totalItems = parseInt(countResult.rows[0].count);

        // Add sorting and pagination
        query += ` ORDER BY ${sortField} ${sortDir} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limitNum, offset);

        const result = await db.query(query, params);
        
        res.json({
            items: result.rows,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalItems,
                totalPages: Math.ceil(totalItems / limitNum),
                hasNext: pageNum < Math.ceil(totalItems / limitNum),
                hasPrev: pageNum > 1
            }
        });
    } catch (err) {
        console.error('Error fetching files:', err);
        res.status(500).json({ error: 'Error al obtener los archivos' });
    }
};

exports.updateFile = async (req, res) => {
    const { id } = req.params;
    const { original_name, folder } = req.body;

    try {
        // Check if file exists
        const current = await db.query('SELECT * FROM media_files WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        const updates = [];
        const params = [];
        let paramCount = 1;

        if (original_name !== undefined) {
            // Validate original_name
            if (!original_name || original_name.trim().length === 0) {
                return res.status(400).json({ error: 'El nombre del archivo no puede estar vacío' });
            }
            params.push(original_name.trim());
            updates.push(`original_name = $${paramCount++}`);
        }

        if (folder !== undefined) {
            // Validate folder name
            if (!/^[a-zA-Z0-9_-]+$/.test(folder)) {
                return res.status(400).json({ error: 'Nombre de carpeta inválido' });
            }
            params.push(folder);
            updates.push(`folder = $${paramCount++}`);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
        }

        params.push(id);
        const query = `UPDATE media_files SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        
        const result = await db.query(query, params);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating file:', err);
        res.status(500).json({ error: 'Error al actualizar el archivo' });
    }
};

exports.moveFile = async (req, res) => {
    const { id } = req.params;
    const { folder } = req.body;

    if (!folder) {
        return res.status(400).json({ error: 'Se requiere una carpeta destino' });
    }

    // Validate folder name
    if (!/^[a-zA-Z0-9_-]+$/.test(folder)) {
        return res.status(400).json({ error: 'Nombre de carpeta inválido' });
    }

    try {
        const current = await db.query('SELECT * FROM media_files WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        const result = await db.query(
            'UPDATE media_files SET folder = $1 WHERE id = $2 RETURNING *',
            [folder, id]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error moving file:', err);
        res.status(500).json({ error: 'Error al mover el archivo' });
    }
};

exports.deleteFile = async (req, res) => {
    const { id } = req.params;
    try {
        const current = await db.query('SELECT * FROM media_files WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        const file = current.rows[0];
        const fullPath = path.join(__dirname, '..', file.path);

        // Delete from database first
        await db.query('DELETE FROM media_files WHERE id = $1', [id]);

        // Then try to delete file from filesystem
        if (fs.existsSync(fullPath)) {
            try {
                fs.unlinkSync(fullPath);
            } catch (fsErr) {
                console.error('Error deleting file from filesystem:', fsErr);
                // Continue anyway - DB record is already deleted
            }
        }

        res.json({ message: 'Archivo eliminado correctamente' });
    } catch (err) {
        console.error('Error deleting file:', err);
        res.status(500).json({ error: 'Error al eliminar el archivo' });
    }
};

exports.deleteMultipleFiles = async (req, res) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de IDs' });
    }

    // Limit to 50 files at a time
    if (ids.length > 50) {
        return res.status(400).json({ error: 'Máximo 50 archivos por operación' });
    }

    try {
        // Get all files
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
        const files = await db.query(
            `SELECT * FROM media_files WHERE id IN (${placeholders})`,
            ids
        );

        if (files.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron archivos' });
        }

        // Delete from database
        await db.query(`DELETE FROM media_files WHERE id IN (${placeholders})`, ids);

        // Delete files from filesystem
        let deletedCount = 0;
        for (const file of files.rows) {
            const fullPath = path.join(__dirname, '..', file.path);
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                    deletedCount++;
                } catch (fsErr) {
                    console.error(`Error deleting file ${file.filename}:`, fsErr);
                }
            }
        }

        res.json({ 
            message: `${files.rows.length} archivos eliminados de la base de datos, ${deletedCount} archivos eliminados del sistema de archivos`,
            deletedCount: files.rows.length
        });
    } catch (err) {
        console.error('Error deleting multiple files:', err);
        res.status(500).json({ error: 'Error al eliminar los archivos' });
    }
};

exports.getFolders = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT f.name as folder, COUNT(m.id) as file_count 
            FROM media_folders f 
            LEFT JOIN media_files m ON f.name = m.folder 
            GROUP BY f.name 
            ORDER BY f.name
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching folders:', err);
        res.status(500).json({ error: 'Error al obtener las carpetas' });
    }
};

exports.createFolder = async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'El nombre de la carpeta es requerido' });
    }

    // Validate folder name
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
        return res.status(400).json({ error: 'Nombre de carpeta inválido. Use solo letras, números, guiones y guiones bajos.' });
    }

    try {
        // Check if folder already exists
        const existing = await db.query(
            'SELECT name FROM media_folders WHERE name = $1 LIMIT 1',
            [name]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'La carpeta ya existe' });
        }

        // Create folder in media_folders table
        await db.query(
            'INSERT INTO media_folders (name) VALUES ($1)',
            [name]
        );

        res.status(201).json({ 
            folder: name, 
            message: 'Carpeta creada exitosamente',
            file_count: 0
        });
    } catch (err) {
        console.error('Error creating folder:', err);
        res.status(500).json({ error: 'Error al crear la carpeta' });
    }
};

exports.getFileStats = async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total_files,
                SUM(size) as total_size,
                COUNT(DISTINCT folder) as total_folders,
                COUNT(CASE WHEN mime_type LIKE 'image/%' THEN 1 END) as image_count,
                COUNT(CASE WHEN mime_type LIKE 'video/%' THEN 1 END) as video_count,
                COUNT(CASE WHEN mime_type LIKE 'audio/%' THEN 1 END) as audio_count,
                COUNT(CASE WHEN mime_type LIKE 'application/%' THEN 1 END) as document_count
            FROM media_files
        `);

        res.json(stats.rows[0]);
    } catch (err) {
        console.error('Error fetching file stats:', err);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
};
