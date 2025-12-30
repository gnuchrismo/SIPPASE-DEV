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
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function addBlogMenuItem() {
  try {
    // 1. Find the category ID for the main admin menu
    // We'll look for an existing item like 'Dashboard' to find the category
    const categoryResult = await pool.query(`
      SELECT category_id 
      FROM menu_items 
      WHERE route_path = '/admin/dashboard' 
      LIMIT 1
    `);

    if (categoryResult.rows.length === 0) {
      console.error('Could not find the "Dashboard" menu item to determine the category.');
      return;
    }

    const categoryId = categoryResult.rows[0].category_id;
    console.log(`Found Admin Menu Category ID: ${categoryId}`);

    // 2. Check if Blog item already exists
    const checkResult = await pool.query(`
      SELECT id FROM menu_items 
      WHERE route_path = '/admin/blog' AND category_id = $1
    `, [categoryId]);

    if (checkResult.rows.length > 0) {
      console.log('Blog menu item already exists.');
      return;
    }

    // 3. Get the max display_order to append it at the end (or specific position)
    // Let's try to put it before 'Estadísticas' or just append it.
    // The user wanted it after 'Documentos'. Let's find 'Documentos' order.
    
    const docResult = await pool.query(`
      SELECT display_order FROM menu_items 
      WHERE route_path = '/admin/documents' AND category_id = $1
    `, [categoryId]);
    
    let newOrder = 100; // Default fallback
    
    if (docResult.rows.length > 0) {
        // Place it after documents
        const docOrder = docResult.rows[0].display_order;
        newOrder = docOrder + 1;
        
        // Shift items after documents to make space
        await pool.query(`
            UPDATE menu_items 
            SET display_order = display_order + 1 
            WHERE category_id = $1 AND display_order > $2
        `, [categoryId, docOrder]);
    } else {
        // Just get max + 1
        const maxResult = await pool.query(`
            SELECT MAX(display_order) as max_order 
            FROM menu_items 
            WHERE category_id = $1
        `, [categoryId]);
        newOrder = (maxResult.rows[0].max_order || 0) + 1;
    }

    // 4. Insert the new item
    const insertResult = await pool.query(`
      INSERT INTO menu_items (category_id, title, icon, route_path, display_order, is_active)
      VALUES ($1, 'Blog / Noticias', 'article', '/admin/blog', $2, true)
      RETURNING id
    `, [categoryId, newOrder]);

    console.log(`Successfully added "Blog / Noticias" menu item with ID: ${insertResult.rows[0].id}`);

  } catch (err) {
    console.error('Error adding blog menu item:', err);
  } finally {
    await pool.end();
  }
}

addBlogMenuItem();
