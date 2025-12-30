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
const pool = require('../db');

/**
 * Pages Controller
 * Handles CRUD operations for additional pages (privacy policy, terms of use, etc.)
 */

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

// Get all pages (admin view with all statuses)
exports.getAllPages = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = null,
      footer = null 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        p.*,
        u.username as author_name
      FROM pages p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (search) {
      query += ` AND (p.title ILIKE $${paramCount} OR p.slug ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    if (status !== null && status !== '') {
      const isPublished = status === 'published' || status === 'true';
      query += ` AND p.is_published = $${paramCount}`;
      params.push(isPublished);
      paramCount++;
    }
    
    if (footer !== null && footer !== '') {
      const showInFooter = footer === 'true';
      query += ` AND p.show_in_footer = $${paramCount}`;
      params.push(showInFooter);
      paramCount++;
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as filtered_pages`;
    const countResult = await pool.query(countQuery, params);
    const totalItems = parseInt(countResult.rows[0].count);
    
    // Add ordering and pagination
    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    res.json({
      items: result.rows,
      pagination: {
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Error al obtener páginas' });
  }
};

// Get published pages (public view)
exports.getPublishedPages = async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        title,
        slug,
        meta_description,
        show_in_footer,
        display_order,
        created_at,
        updated_at
      FROM pages
      WHERE is_published = true
      ORDER BY display_order ASC, title ASC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching published pages:', error);
    res.status(500).json({ error: 'Error al obtener páginas publicadas' });
  }
};

// Get page by slug (public view)
exports.getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const query = `
      SELECT 
        p.*,
        u.username as author_name
      FROM pages p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.slug = $1 AND p.is_published = true
    `;
    
    const result = await pool.query(query, [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    res.status(500).json({ error: 'Error al obtener página' });
  }
};

// Get page by ID (admin view)
exports.getPageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.*,
        u.username as author_name
      FROM pages p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching page by ID:', error);
    res.status(500).json({ error: 'Error al obtener página' });
  }
};

// Create new page
exports.createPage = async (req, res) => {
  try {
    const {
      title,
      slug: customSlug,
      content,
      meta_description,
      meta_keywords,
      is_published = false,
      show_in_footer = false,
      display_order = 0
    } = req.body;
    
    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'El título es requerido' });
    }
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'El contenido es requerido' });
    }
    
    // Generate slug if not provided
    const slug = customSlug || generateSlug(title);
    
    // Check if slug already exists
    const slugCheck = await pool.query('SELECT id FROM pages WHERE slug = $1', [slug]);
    if (slugCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe una página con este slug' });
    }
    
    const author_id = req.user?.id || null;
    
    const query = `
      INSERT INTO pages (
        title, slug, content, meta_description, meta_keywords,
        is_published, show_in_footer, display_order, author_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      title.trim(),
      slug,
      content,
      meta_description || null,
      meta_keywords || null,
      is_published,
      show_in_footer,
      display_order,
      author_id
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating page:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Ya existe una página con este slug' });
    }
    
    res.status(500).json({ error: 'Error al crear página' });
  }
};

// Update page
exports.updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      content,
      meta_description,
      meta_keywords,
      is_published,
      show_in_footer,
      display_order
    } = req.body;
    
    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'El título es requerido' });
    }
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'El contenido es requerido' });
    }
    
    if (!slug || slug.trim().length === 0) {
      return res.status(400).json({ error: 'El slug es requerido' });
    }
    
    // Check if slug already exists for another page
    const slugCheck = await pool.query(
      'SELECT id FROM pages WHERE slug = $1 AND id != $2',
      [slug, id]
    );
    if (slugCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe otra página con este slug' });
    }
    
    const query = `
      UPDATE pages
      SET 
        title = $1,
        slug = $2,
        content = $3,
        meta_description = $4,
        meta_keywords = $5,
        is_published = $6,
        show_in_footer = $7,
        display_order = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;
    
    const values = [
      title.trim(),
      slug.trim(),
      content,
      meta_description || null,
      meta_keywords || null,
      is_published !== undefined ? is_published : false,
      show_in_footer !== undefined ? show_in_footer : false,
      display_order !== undefined ? display_order : 0,
      id
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating page:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Ya existe una página con este slug' });
    }
    
    res.status(500).json({ error: 'Error al actualizar página' });
  }
};

// Delete page
exports.deletePage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM pages WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }
    
    res.json({ message: 'Página eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Error al eliminar página' });
  }
};

// Export generateSlug for use in other modules
exports.generateSlug = generateSlug;
