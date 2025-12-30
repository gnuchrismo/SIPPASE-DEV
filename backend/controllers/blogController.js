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

// Configure multer for featured image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/blog');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, 'blog-' + uniqueSuffix + '-' + sanitizedName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for featured images
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
        }
    }
});

exports.upload = upload;

// Helper function to generate URL-friendly slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

// Get all posts (admin view with all statuses)
exports.getAllPosts = async (req, res) => {
    try {
        const { status, category, search, page = 1, limit = 20 } = req.query;
        
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        let query = `
            SELECT 
                bp.*,
                u.username as author_name,
                (SELECT COUNT(*) FROM blog_media WHERE blog_post_id = bp.id) as media_count
            FROM blog_posts bp
            LEFT JOIN users u ON bp.author_id = u.id
        `;
        const params = [];
        const conditions = [];

        if (status) {
            params.push(status);
            conditions.push(`bp.status = $${params.length}`);
        }

        if (category) {
            params.push(category);
            conditions.push(`bp.category = $${params.length}`);
        }

        if (search) {
            params.push(`%${search}%`);
            conditions.push(`(bp.title ILIKE $${params.length} OR bp.summary ILIKE $${params.length})`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM blog_posts bp';
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        
        const countResult = await db.query(countQuery, params);
        const totalItems = parseInt(countResult.rows[0].count);

        // Add sorting and pagination
        query += ` ORDER BY bp.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Error al obtener las publicaciones' });
    }
};

// Get published posts (public view)
exports.getPublishedPosts = async (req, res) => {
    try {
        const { category, page = 1, limit = 6 } = req.query;
        
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        let query = `
            SELECT 
                bp.id,
                bp.title,
                bp.slug,
                bp.summary,
                bp.featured_image_url,
                bp.category,
                bp.published_at,
                bp.view_count,
                u.username as author_name,
                (SELECT COUNT(*) FROM blog_media WHERE blog_post_id = bp.id) as media_count
            FROM blog_posts bp
            LEFT JOIN users u ON bp.author_id = u.id
            WHERE bp.status = 'published' AND bp.published_at IS NOT NULL
        `;
        const params = [];

        if (category) {
            params.push(category);
            query += ` AND bp.category = $${params.length}`;
        }

        // Get total count
        let countQuery = `SELECT COUNT(*) FROM blog_posts bp WHERE bp.status = 'published' AND bp.published_at IS NOT NULL`;
        if (category) {
            countQuery += ` AND bp.category = $1`; // param index 1 matches params[0]
        }
        
        const countResult = await db.query(countQuery, params);
        const totalItems = parseInt(countResult.rows[0].count);

        // Add sorting and pagination
        query += ` ORDER BY bp.published_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
        console.error('Error fetching published posts:', err);
        res.status(500).json({ error: 'Error al obtener las publicaciones' });
    }
};

// Get post by slug (public view)
exports.getPostBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
        const result = await db.query(`
            SELECT 
                bp.*,
                u.username as author_name
            FROM blog_posts bp
            LEFT JOIN users u ON bp.author_id = u.id
            WHERE bp.slug = $1 AND bp.status = 'published'
        `, [slug]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        // Increment view count
        await db.query('UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1', [result.rows[0].id]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching post by slug:', err);
        res.status(500).json({ error: 'Error al obtener la publicación' });
    }
};

// Get post by ID (admin view)
exports.getPostById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`
            SELECT 
                bp.*,
                u.username as author_name
            FROM blog_posts bp
            LEFT JOIN users u ON bp.author_id = u.id
            WHERE bp.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching post:', err);
        res.status(500).json({ error: 'Error al obtener la publicación' });
    }
};

// Create new post
exports.createPost = async (req, res) => {
    const { title, summary, content, category, status } = req.body;
    const author_id = req.user.id;

    if (!title) {
        return res.status(400).json({ error: 'El título es requerido' });
    }

    try {
        // Generate slug
        let slug = generateSlug(title);
        
        // Ensure slug is unique
        const existingSlug = await db.query('SELECT id FROM blog_posts WHERE slug = $1', [slug]);
        if (existingSlug.rows.length > 0) {
            slug = `${slug}-${Date.now()}`;
        }

        const featured_image_url = req.file ? `/uploads/blog/${req.file.filename}` : null;
        const published_at = status === 'published' ? new Date() : null;

        const result = await db.query(`
            INSERT INTO blog_posts (
                title, slug, summary, featured_image_url, content, 
                status, category, author_id, published_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *
        `, [title, slug, summary, featured_image_url, content, status || 'draft', category || 'Noticias', author_id, published_at]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating post:', err);
        // Clean up uploaded file if DB insert fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Error al crear la publicación' });
    }
};

// Update post
exports.updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, summary, content, category, status } = req.body;

    try {
        console.log('Updating post:', id);
        console.log('Body:', req.body);
        console.log('File:', req.file);

        const current = await db.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        let featured_image_url = current.rows[0].featured_image_url;
        let slug = current.rows[0].slug;

        // Update slug if title changed
        if (title && title !== current.rows[0].title) {
            slug = generateSlug(title);
            const existingSlug = await db.query('SELECT id FROM blog_posts WHERE slug = $1 AND id != $2', [slug, id]);
            if (existingSlug.rows.length > 0) {
                slug = `${slug}-${Date.now()}`;
            }
        }

        // Handle new featured image
        if (req.file) {
            // Delete old image
            if (current.rows[0].featured_image_url) {
                try {
                    const oldFilePath = path.join(__dirname, '..', current.rows[0].featured_image_url);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                } catch (e) {
                    console.warn('Error deleting old image:', e);
                }
            }
            featured_image_url = `/uploads/blog/${req.file.filename}`;
        }

        // Update published_at if status changed to published
        let published_at = current.rows[0].published_at;
        if (status === 'published' && current.rows[0].status !== 'published') {
            published_at = new Date();
        }

        const result = await db.query(`
            UPDATE blog_posts 
            SET title = $1, slug = $2, summary = $3, featured_image_url = $4, 
                content = $5, status = $6, category = $7, published_at = $8
            WHERE id = $9 
            RETURNING *
        `, [
            title || current.rows[0].title,
            slug,
            summary !== undefined ? summary : current.rows[0].summary,
            featured_image_url,
            content !== undefined ? content : current.rows[0].content,
            status || current.rows[0].status,
            category || current.rows[0].category,
            published_at,
            id
        ]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({ error: 'Error al actualizar la publicación: ' + err.message });
    }
};

// Delete post
exports.deletePost = async (req, res) => {
    const { id } = req.params;
    try {
        const current = await db.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        // Delete featured image
        if (current.rows[0].featured_image_url) {
            const filePath = path.join(__dirname, '..', current.rows[0].featured_image_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete post (cascade will delete blog_media entries)
        await db.query('DELETE FROM blog_posts WHERE id = $1', [id]);
        res.json({ message: 'Publicación eliminada correctamente' });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ error: 'Error al eliminar la publicación' });
    }
};

// Get post media
exports.getPostMedia = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`
            SELECT 
                bm.*,
                CASE 
                    WHEN bm.media_type = 'document' THEN d.title
                    WHEN bm.media_type = 'video' THEN mf.original_name
                    ELSE bm.title
                END as media_title,
                CASE 
                    WHEN bm.media_type = 'document' THEN d.file_url
                    WHEN bm.media_type = 'video' THEN mf.path
                    ELSE NULL
                END as media_url
            FROM blog_media bm
            LEFT JOIN documents d ON bm.media_type = 'document' AND bm.media_id = d.id
            LEFT JOIN media_files mf ON bm.media_type = 'video' AND bm.media_id = mf.id
            WHERE bm.blog_post_id = $1
            ORDER BY bm.display_order, bm.created_at
        `, [id]);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching post media:', err);
        res.status(500).json({ error: 'Error al obtener los medios' });
    }
};

// Add media to post
exports.addMedia = async (req, res) => {
    const { id } = req.params;
    const { media_type, media_id, youtube_url, title, description, display_order } = req.body;

    if (!media_type || !['document', 'video', 'youtube'].includes(media_type)) {
        return res.status(400).json({ error: 'Tipo de medio inválido' });
    }

    if (media_type === 'youtube' && !youtube_url) {
        return res.status(400).json({ error: 'URL de YouTube requerida' });
    }

    if ((media_type === 'document' || media_type === 'video') && !media_id) {
        return res.status(400).json({ error: 'ID de medio requerido' });
    }

    try {
        // Verify post exists
        const post = await db.query('SELECT id FROM blog_posts WHERE id = $1', [id]);
        if (post.rows.length === 0) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        const result = await db.query(`
            INSERT INTO blog_media (
                blog_post_id, media_type, media_id, youtube_url, title, description, display_order
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [id, media_type, media_id || null, youtube_url || null, title || null, description || null, display_order || 0]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding media:', err);
        res.status(500).json({ error: 'Error al agregar el medio' });
    }
};

// Remove media from post
exports.removeMedia = async (req, res) => {
    const { id, mediaId } = req.params;
    try {
        const result = await db.query(
            'DELETE FROM blog_media WHERE id = $1 AND blog_post_id = $2 RETURNING *',
            [mediaId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Medio no encontrado' });
        }

        res.json({ message: 'Medio eliminado correctamente' });
    } catch (err) {
        console.error('Error removing media:', err);
        res.status(500).json({ error: 'Error al eliminar el medio' });
    }
};

// Get categories
exports.getCategories = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT DISTINCT category, COUNT(*) as count
            FROM blog_posts
            GROUP BY category
            ORDER BY category
        `);

        // Default categories
        const defaultCategories = ['Noticias', 'Eventos', 'Comunicados', 'Capacitación', 'Informes'];
        
        // Merge with existing categories
        const existingCategories = result.rows.map(r => r.category);
        const allCategories = [...new Set([...defaultCategories, ...existingCategories])];

        res.json(allCategories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};
