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
 * Menu Controller
 * Handles all menu and route management operations
 */

/**
 * Validate menu item data
 * @param {Object} data - Menu item data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Array} Array of validation error messages
 */
function validateMenuItem(data, isUpdate = false) {
    const errors = [];
    
    // Title validation
    if (!isUpdate && (!data.title || data.title.trim().length === 0)) {
        errors.push({ field: 'title', message: 'El título es requerido' });
    }
    if (data.title && data.title.length > 100) {
        errors.push({ field: 'title', message: 'El título no puede exceder 100 caracteres' });
    }
    
    // Category validation
    if (!isUpdate && !data.category_id) {
        errors.push({ field: 'category_id', message: 'La categoría es requerida' });
    }
    
    // Description validation
    if (data.description && data.description.length > 500) {
        errors.push({ field: 'description', message: 'La descripción no puede exceder 500 caracteres' });
    }
    
    // Icon validation
    if (data.icon && data.icon.length > 100) {
        errors.push({ field: 'icon', message: 'El nombre del icono no puede exceder 100 caracteres' });
    }
    
    // Route/URL validation
    if (data.route_path && data.route_path.length > 255) {
        errors.push({ field: 'route_path', message: 'La ruta no puede exceder 255 caracteres' });
    }
    if (data.external_url && data.external_url.length > 255) {
        errors.push({ field: 'external_url', message: 'La URL externa no puede exceder 255 caracteres' });
    }
    
    // External URL format validation
    if (data.external_url && data.external_url.trim().length > 0) {
        try {
            new URL(data.external_url);
        } catch (e) {
            errors.push({ field: 'external_url', message: 'La URL externa no tiene un formato válido' });
        }
    }
    
    // Display order validation
    if (data.display_order !== undefined && data.display_order !== null) {
        const order = parseInt(data.display_order);
        if (isNaN(order) || order < 0) {
            errors.push({ field: 'display_order', message: 'El orden debe ser un número positivo' });
        }
    }
    
    // Badge text validation
    if (data.badge_text && data.badge_text.length > 20) {
        errors.push({ field: 'badge_text', message: 'El texto del badge no puede exceder 20 caracteres' });
    }
    
    // CSS class validation
    if (data.css_class && data.css_class.length > 100) {
        errors.push({ field: 'css_class', message: 'La clase CSS no puede exceder 100 caracteres' });
    }
    
    return errors;
}

// Get all menu categories
exports.getCategories = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM menu_categories 
             WHERE is_active = true 
             ORDER BY display_order ASC, name ASC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching menu categories:', error);
        res.status(500).json({ error: 'Error al obtener categorías de menú' });
    }
};

// Get menu items for a specific category
exports.getItemsByCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            `SELECT mi.*, mc.name as category_name, mc.location,
                    (SELECT json_agg(child ORDER BY child.display_order)
                     FROM menu_items child
                     WHERE child.parent_id = mi.id AND child.is_active = true) as children
             FROM menu_items mi
             JOIN menu_categories mc ON mi.category_id = mc.id
             WHERE mi.category_id = $1 AND mi.parent_id IS NULL
             ORDER BY mi.display_order ASC`,
            [id]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'Error al obtener items de menú' });
    }
};

// Get public menu structure (filtered and organized)
exports.getPublicMenu = async (req, res) => {
    try {
        const result = await pool.query(
            `WITH RECURSIVE menu_tree AS (
                -- Base case: top-level items
                SELECT 
                    mi.id, mi.category_id, mi.parent_id, mi.title, mi.description,
                    mi.icon, mi.icon_type, mi.route_path, mi.external_url,
                    mi.display_order, mi.open_in_new_tab, mi.css_class,
                    mi.badge_text, mi.badge_color, mi.metadata,
                    mc.name as category_name, mc.slug as category_slug,
                    mc.location, 1 as level
                FROM menu_items mi
                JOIN menu_categories mc ON mi.category_id = mc.id
                WHERE mi.parent_id IS NULL 
                  AND mi.is_active = true 
                  AND mi.is_visible_public = true
                  AND mc.is_active = true
                  AND mc.location IN ('public', 'footer', 'mobile')
                
                UNION ALL
                
                -- Recursive case: child items
                SELECT 
                    mi.id, mi.category_id, mi.parent_id, mi.title, mi.description,
                    mi.icon, mi.icon_type, mi.route_path, mi.external_url,
                    mi.display_order, mi.open_in_new_tab, mi.css_class,
                    mi.badge_text, mi.badge_color, mi.metadata,
                    mt.category_name, mt.category_slug, mt.location, mt.level + 1
                FROM menu_items mi
                JOIN menu_tree mt ON mi.parent_id = mt.id
                WHERE mi.is_active = true AND mi.is_visible_public = true
            )
            SELECT * FROM menu_tree
            ORDER BY category_id, level, display_order`
        );
        
        // Organize into hierarchical structure
        const menuStructure = organizeMenuHierarchy(result.rows);
        res.json(menuStructure);
    } catch (error) {
        console.error('Error fetching public menu:', error);
        res.status(500).json({ error: 'Error al obtener menú público' });
    }
};

// Get admin menu structure (filtered by user role)
exports.getAdminMenu = async (req, res) => {
    try {
        const userRole = req.user?.role || 'editor';
        
        const result = await pool.query(
            `WITH RECURSIVE menu_tree AS (
                -- Base case: top-level items
                SELECT 
                    mi.id, mi.category_id, mi.parent_id, mi.title, mi.description,
                    mi.icon, mi.icon_type, mi.route_path, mi.external_url,
                    mi.display_order, mi.required_role, mi.css_class,
                    mi.badge_text, mi.badge_color, mi.metadata,
                    mc.name as category_name, 1 as level
                FROM menu_items mi
                JOIN menu_categories mc ON mi.category_id = mc.id
                WHERE mi.parent_id IS NULL 
                  AND mi.is_active = true
                  AND mc.is_active = true
                  AND mc.location = 'admin'
                  AND (mi.required_role IS NULL OR mi.required_role = $1 OR $1 = 'admin')
                
                UNION ALL
                
                -- Recursive case: child items
                SELECT 
                    mi.id, mi.category_id, mi.parent_id, mi.title, mi.description,
                    mi.icon, mi.icon_type, mi.route_path, mi.external_url,
                    mi.display_order, mi.required_role, mi.css_class,
                    mi.badge_text, mi.badge_color, mi.metadata,
                    mt.category_name, mt.level + 1
                FROM menu_items mi
                JOIN menu_tree mt ON mi.parent_id = mt.id
                WHERE mi.is_active = true
                  AND (mi.required_role IS NULL OR mi.required_role = $1 OR $1 = 'admin')
            )
            SELECT * FROM menu_tree
            ORDER BY category_id, level, display_order`,
            [userRole]
        );
        
        const menuStructure = organizeMenuHierarchy(result.rows);
        res.json(menuStructure);
    } catch (error) {
        console.error('Error fetching admin menu:', error);
        res.status(500).json({ error: 'Error al obtener menú administrativo' });
    }
};

// Create new menu item
exports.createMenuItem = async (req, res) => {
    try {
        const {
            category_id, parent_id, title, description, icon, icon_type,
            route_path, external_url, display_order, is_active,
            is_visible_public, required_role, open_in_new_tab,
            css_class, badge_text, badge_color, metadata
        } = req.body;
        
        // Comprehensive validation
        const validationErrors = validateMenuItem(req.body, false);
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                error: 'Errores de validación',
                errors: validationErrors 
            });
        }
        
        // Check if category exists
        const categoryCheck = await pool.query(
            'SELECT id FROM menu_categories WHERE id = $1',
            [category_id]
        );
        if (categoryCheck.rows.length === 0) {
            return res.status(400).json({ 
                error: 'La categoría especificada no existe',
                errors: [{ field: 'category_id', message: 'Categoría no encontrada' }]
            });
        }
        
        // Check for circular parent reference if parent_id is provided
        if (parent_id) {
            const parentCheck = await pool.query(
                'SELECT id, parent_id FROM menu_items WHERE id = $1',
                [parent_id]
            );
            if (parentCheck.rows.length === 0) {
                return res.status(400).json({ 
                    error: 'El item padre especificado no existe',
                    errors: [{ field: 'parent_id', message: 'Item padre no encontrado' }]
                });
            }
        }
        
        const result = await pool.query(
            `INSERT INTO menu_items (
                category_id, parent_id, title, description, icon, icon_type,
                route_path, external_url, display_order, is_active,
                is_visible_public, required_role, open_in_new_tab,
                css_class, badge_text, badge_color, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *`,
            [
                category_id, 
                parent_id || null, 
                title.trim(), 
                description ? description.trim() : null, 
                icon || null, 
                icon_type || 'material',
                route_path || null, 
                external_url || null, 
                display_order || 0, 
                is_active !== false,
                is_visible_public !== false, 
                required_role || null, 
                open_in_new_tab || false,
                css_class || null, 
                badge_text || null, 
                badge_color || null, 
                JSON.stringify(metadata || {})
            ]
        );
        
        // Log audit
        if (req.user) {
            await pool.query(
                `INSERT INTO audit_logs (user_id, action, entity, entity_id, details)
                 VALUES ($1, 'CREATE', 'menu_item', $2, $3)`,
                [req.user.id, result.rows[0].id, JSON.stringify({ title: title.trim() })]
            );
        }
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating menu item:', error);
        
        // Handle specific database errors
        if (error.code === '23503') { // Foreign key violation
            return res.status(400).json({ 
                error: 'Error de referencia',
                message: 'La categoría o item padre especificado no existe'
            });
        }
        if (error.code === '23514') { // Check constraint violation
            return res.status(400).json({ 
                error: 'Error de validación',
                message: 'Los datos no cumplen con las restricciones del sistema'
            });
        }
        
        res.status(500).json({ 
            error: 'Error al crear item de menú',
            message: 'Ocurrió un error interno. Por favor, intente nuevamente.'
        });
    }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            category_id, parent_id, title, description, icon, icon_type,
            route_path, external_url, display_order, is_active,
            is_visible_public, required_role, open_in_new_tab,
            css_class, badge_text, badge_color, metadata
        } = req.body;
        
        // Comprehensive validation
        const validationErrors = validateMenuItem(req.body, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                error: 'Errores de validación',
                errors: validationErrors 
            });
        }
        
        // Check if item exists
        const itemCheck = await pool.query('SELECT id FROM menu_items WHERE id = $1', [id]);
        if (itemCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Item de menú no encontrado' });
        }
        
        // Check for circular parent reference
        if (parent_id) {
            if (parseInt(parent_id) === parseInt(id)) {
                return res.status(400).json({ 
                    error: 'Referencia circular',
                    message: 'Un item no puede ser su propio padre'
                });
            }
            
            const parentCheck = await pool.query(
                'SELECT id, parent_id FROM menu_items WHERE id = $1',
                [parent_id]
            );
            if (parentCheck.rows.length === 0) {
                return res.status(400).json({ 
                    error: 'El item padre especificado no existe',
                    errors: [{ field: 'parent_id', message: 'Item padre no encontrado' }]
                });
            }
        }
        
        const result = await pool.query(
            `UPDATE menu_items SET
                category_id = COALESCE($1, category_id),
                parent_id = $2,
                title = COALESCE($3, title),
                description = $4,
                icon = $5,
                icon_type = COALESCE($6, icon_type),
                route_path = $7,
                external_url = $8,
                display_order = COALESCE($9, display_order),
                is_active = COALESCE($10, is_active),
                is_visible_public = COALESCE($11, is_visible_public),
                required_role = $12,
                open_in_new_tab = COALESCE($13, open_in_new_tab),
                css_class = $14,
                badge_text = $15,
                badge_color = $16,
                metadata = COALESCE($17, metadata)
             WHERE id = $18
             RETURNING *`,
            [
                category_id, 
                parent_id || null, 
                title ? title.trim() : null, 
                description ? description.trim() : null, 
                icon || null, 
                icon_type,
                route_path || null, 
                external_url || null, 
                display_order, 
                is_active,
                is_visible_public, 
                required_role || null, 
                open_in_new_tab,
                css_class || null, 
                badge_text || null, 
                badge_color || null,
                metadata ? JSON.stringify(metadata) : null, id
            ]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item de menú no encontrado' });
        }
        
        // Log audit
        if (req.user) {
            await pool.query(
                `INSERT INTO audit_logs (user_id, action, entity, entity_id, details)
                 VALUES ($1, 'UPDATE', 'menu_item', $2, $3)`,
                [req.user.id, id, JSON.stringify({ title: result.rows[0].title })]
            );
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating menu item:', error);
        
        // Handle specific database errors
        if (error.code === '23503') {
            return res.status(400).json({ 
                error: 'Error de referencia',
                message: 'La categoría o item padre especificado no existe'
            });
        }
        if (error.code === '23514') {
            return res.status(400).json({ 
                error: 'Error de validación',
                message: 'Los datos no cumplen con las restricciones del sistema'
            });
        }
        
        res.status(500).json({ 
            error: 'Error al actualizar item de menú',
            message: 'Ocurrió un error interno. Por favor, intente nuevamente.'
        });
    }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM menu_items WHERE id = $1 RETURNING title',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item de menú no encontrado' });
        }
        
        // Log audit
        if (req.user) {
            await pool.query(
                `INSERT INTO audit_logs (user_id, action, entity, entity_id, details)
                 VALUES ($1, 'DELETE', 'menu_item', $2, $3)`,
                [req.user.id, id, JSON.stringify({ title: result.rows[0].title })]
            );
        }
        
        res.json({ message: 'Item de menú eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ error: 'Error al eliminar item de menú' });
    }
};

// Reorder menu items (batch update)
exports.reorderMenuItems = async (req, res) => {
    try {
        const { items } = req.body; // Array of { id, display_order }
        
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'Se requiere un array de items' });
        }
        
        const client = await pool.pool.connect();
        try {
            await client.query('BEGIN');
            
            for (const item of items) {
                await client.query(
                    'UPDATE menu_items SET display_order = $1 WHERE id = $2',
                    [item.display_order, item.id]
                );
            }
            
            await client.query('COMMIT');
            res.json({ message: 'Orden actualizado exitosamente' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error reordering menu items:', error);
        res.status(500).json({ error: 'Error al reordenar items de menú', details: error.message, stack: error.stack });
    }
};

// Get all route metadata
exports.getRouteMetadata = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM route_metadata ORDER BY route_path ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching route metadata:', error);
        res.status(500).json({ error: 'Error al obtener metadatos de rutas' });
    }
};

// Helper function to organize flat menu data into hierarchical structure
function organizeMenuHierarchy(flatMenu) {
    const categories = {};
    const itemsById = {};
    
    // First pass: index all items by ID
    flatMenu.forEach(item => {
        itemsById[item.id] = { ...item, children: [] };
    });
    
    // Second pass: build hierarchy
    flatMenu.forEach(item => {
        const categoryKey = item.category_slug || item.category_name;
        
        if (!categories[categoryKey]) {
            categories[categoryKey] = {
                name: item.category_name,
                slug: item.category_slug,
                location: item.location,
                items: []
            };
        }
        
        if (item.parent_id === null) {
            // Top-level item
            categories[categoryKey].items.push(itemsById[item.id]);
        } else if (itemsById[item.parent_id]) {
            // Child item
            itemsById[item.parent_id].children.push(itemsById[item.id]);
        }
    });
    
    return categories;
}

module.exports = exports;
