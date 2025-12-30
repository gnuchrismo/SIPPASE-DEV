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

/**
 * Get all document categories (admin view - includes inactive)
 */
exports.getAllCategories = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM document_categories ORDER BY display_order ASC, name ASC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all categories:', err);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};

/**
 * Get active categories only (public view)
 */
exports.getActiveCategories = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, description, icon, display_order FROM document_categories WHERE is_active = true ORDER BY display_order ASC, name ASC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching active categories:', err);
        res.status(500).json({ error: 'Error al obtener categorías activas' });
    }
};

/**
 * Get a single category by ID
 */
exports.getCategory = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await db.query(
            'SELECT * FROM document_categories WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching category:', err);
        res.status(500).json({ error: 'Error al obtener categoría' });
    }
};

/**
 * Create a new document category
 */
exports.createCategory = async (req, res) => {
    const { name, description, icon, display_order, is_active } = req.body;
    
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    try {
        // Check if category with same name already exists
        const existing = await db.query(
            'SELECT id FROM document_categories WHERE name = $1',
            [name.trim()]
        );
        
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
        }
        
        // Get max display_order if not provided
        let order = display_order;
        if (!order && order !== 0) {
            const maxOrder = await db.query(
                'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM document_categories'
            );
            order = maxOrder.rows[0].next_order;
        }
        
        const result = await db.query(
            'INSERT INTO document_categories (name, description, icon, display_order, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name.trim(), description || '', icon || 'folder', order, is_active !== false]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ error: 'Error al crear categoría' });
    }
};

/**
 * Update an existing document category
 */
/**
 * Update an existing document category
 */
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description, icon, display_order, is_active } = req.body;
    
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');

        // Check if category exists
        const currentResult = await client.query(
            'SELECT * FROM document_categories WHERE id = $1',
            [id]
        );
        
        if (currentResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        
        const currentCategory = currentResult.rows[0];

        // Check if another category with same name exists (excluding current)
        const existingResult = await client.query(
            'SELECT id FROM document_categories WHERE name = $1 AND id != $2',
            [name.trim(), id]
        );
        
        if (existingResult.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Ya existe otra categoría con ese nombre' });
        }

        // If name changed, update linked documents
        if (currentCategory.name !== name.trim()) {
            await client.query(
                'UPDATE documents SET category = $1 WHERE category = $2',
                [name.trim(), currentCategory.name]
            );
        }
        
        const result = await client.query(
            'UPDATE document_categories SET name = $1, description = $2, icon = $3, display_order = $4, is_active = $5 WHERE id = $6 RETURNING *',
            [
                name.trim(), 
                description || '', 
                icon || 'folder', 
                display_order !== undefined ? display_order : currentCategory.display_order,
                is_active !== undefined ? is_active : currentCategory.is_active,
                id
            ]
        );
        
        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating category:', err);
        res.status(500).json({ error: 'Error al actualizar categoría' });
    } finally {
        client.release();
    }
};

/**
 * Delete a document category
 */
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Check if category exists
        const category = await db.query(
            'SELECT * FROM document_categories WHERE id = $1',
            [id]
        );
        
        if (category.rows.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        
        // Check if there are documents using this category
        const documentsCount = await db.query(
            'SELECT COUNT(*) as count FROM documents WHERE category = $1',
            [category.rows[0].name]
        );
        
        if (parseInt(documentsCount.rows[0].count) > 0) {
            return res.status(400).json({ 
                error: `No se puede eliminar la categoría "${category.rows[0].name}" porque tiene ${documentsCount.rows[0].count} documento(s) asociado(s)` 
            });
        }
        
        await db.query('DELETE FROM document_categories WHERE id = $1', [id]);
        
        res.json({ message: 'Categoría eliminada exitosamente' });
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ error: 'Error al eliminar categoría' });
    }
};

/**
 * Reorder categories
 */
exports.reorderCategories = async (req, res) => {
    const { categories } = req.body; // Array of { id, display_order }
    
    if (!Array.isArray(categories) || categories.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de categorías con su nuevo orden' });
    }
    
    try {
        // Update each category's display_order
        for (const cat of categories) {
            if (cat.id && cat.display_order !== undefined) {
                await db.query(
                    'UPDATE document_categories SET display_order = $1 WHERE id = $2',
                    [cat.display_order, cat.id]
                );
            }
        }
        
        // Return updated list
        const result = await db.query(
            'SELECT * FROM document_categories ORDER BY display_order ASC, name ASC'
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error reordering categories:', err);
        res.status(500).json({ error: 'Error al reordenar categorías' });
    }
};
