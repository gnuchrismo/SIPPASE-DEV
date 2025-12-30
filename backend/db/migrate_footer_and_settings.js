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
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const pool = require('./index');

async function migrateFooterAndSettings() {
    const client = await pool.pool.connect();
    
    try {
        console.log('Connected to database:', process.env.DB_DATABASE);
        const resTables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Available tables:', resTables.rows.map(r => r.table_name).join(', '));

        await client.query('BEGIN');
        console.log('Starting migration...');

        // 1. Update Settings Table Schema
        console.log('Updating settings table schema...');
        
        const columnsToAdd = [
            'contact_email VARCHAR(255)',
            'contact_phone VARCHAR(50)',
            'contact_emergency VARCHAR(50)',
            'social_facebook VARCHAR(255)',
            'social_twitter VARCHAR(255)',
            'social_linkedin VARCHAR(255)',
            'social_instagram VARCHAR(255)',
            'social_youtube VARCHAR(255)'
        ];

        for (const column of columnsToAdd) {
            const columnName = column.split(' ')[0];
            // Check if column exists
            const checkCol = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='site_settings' AND column_name=$1
            `, [columnName]);

            if (checkCol.rows.length === 0) {
                await client.query(`ALTER TABLE site_settings ADD COLUMN ${column}`);
                console.log(`Added column: ${columnName}`);
            } else {
                console.log(`Column already exists: ${columnName}`);
            }
        }

        // 2. Restructure Footer Menu
        console.log('Restructuring footer menu...');

        // Get Footer Category ID
        const footerCatResult = await client.query("SELECT id FROM menu_categories WHERE slug = 'public-footer'");
        if (footerCatResult.rows.length === 0) {
            throw new Error('Footer category not found');
        }
        const footerCatId = footerCatResult.rows[0].id;

        // Create "Navegación" parent item
        let navParentId;
        const navParentResult = await client.query(`
            SELECT id FROM menu_items 
            WHERE category_id = $1 AND title = 'Navegación' AND parent_id IS NULL
        `, [footerCatId]);

        if (navParentResult.rows.length > 0) {
            navParentId = navParentResult.rows[0].id;
            console.log('Found existing "Navegación" section');
        } else {
            const insertNav = await client.query(`
                INSERT INTO menu_items (category_id, title, display_order, is_active, route_path)
                VALUES ($1, 'Navegación', 1, true, '#')
                RETURNING id
            `, [footerCatId]);
            navParentId = insertNav.rows[0].id;
            console.log('Created "Navegación" section');
        }

        // Move existing top-level items to "Navegación" (excluding the new sections themselves)
        // We assume any existing top-level item in footer that isn't "Navegación" or "Legal" should be moved
        await client.query(`
            UPDATE menu_items 
            SET parent_id = $1 
            WHERE category_id = $2 
            AND parent_id IS NULL 
            AND id != $1
            AND title NOT IN ('Navegación', 'Legal')
        `, [navParentId, footerCatId]);
        console.log('Moved existing items to "Navegación"');

        // Create "Legal" parent item
        let legalParentId;
        const legalParentResult = await client.query(`
            SELECT id FROM menu_items 
            WHERE category_id = $1 AND title = 'Legal' AND parent_id IS NULL
        `, [footerCatId]);

        if (legalParentResult.rows.length > 0) {
            legalParentId = legalParentResult.rows[0].id;
            console.log('Found existing "Legal" section');
        } else {
            const insertLegal = await client.query(`
                INSERT INTO menu_items (category_id, title, display_order, is_active, route_path)
                VALUES ($1, 'Legal', 2, true, '#')
                RETURNING id
            `, [footerCatId]);
            legalParentId = insertLegal.rows[0].id;
            console.log('Created "Legal" section');
        }

        // Add default Legal items if they don't exist
        const legalItems = [
            { title: 'Normativa', route: '#normativa' },
            { title: 'Política de Privacidad', route: '/page/privacidad' },
            { title: 'Términos de Uso', route: '/page/terminos' }
        ];

        for (const [index, item] of legalItems.entries()) {
            const checkItem = await client.query(`
                SELECT id FROM menu_items 
                WHERE parent_id = $1 AND title = $2
            `, [legalParentId, item.title]);

            if (checkItem.rows.length === 0) {
                await client.query(`
                    INSERT INTO menu_items (category_id, parent_id, title, route_path, display_order, is_active)
                    VALUES ($1, $2, $3, $4, $5, true)
                `, [footerCatId, legalParentId, item.title, item.route, index + 1]);
                console.log(`Added legal item: ${item.title}`);
            }
        }

        await client.query('COMMIT');
        console.log('Migration completed successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
        throw error;
    } finally {
        client.release();
        // Close the pool to allow script to exit
        setTimeout(() => {
            pool.pool.end();
        }, 1000);
    }
}

migrateFooterAndSettings();
