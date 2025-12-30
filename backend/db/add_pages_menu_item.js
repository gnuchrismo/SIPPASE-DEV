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
const { pool } = require('./index');

async function addPagesMenuItem() {
  const client = await pool.connect();
  try {
    console.log('Adding Pages menu item to admin menu...');
    
    // Check if menu item already exists
    const checkQuery = `
      SELECT id FROM menu_items 
      WHERE route_path = '/admin/pages'
    `;
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✓ Pages menu item already exists');
      return;
    }
    
    // Insert menu item
    const insertQuery = `
      INSERT INTO menu_items (
        category_id, 
        title, 
        description, 
        icon, 
        route_path, 
        display_order, 
        is_active
      )
      VALUES (
        (SELECT id FROM menu_categories WHERE slug = 'admin-main'),
        'Páginas',
        'Gestión de páginas adicionales',
        'article',
        '/admin/pages',
        7,
        true
      )
      RETURNING id, title
    `;
    
    const result = await client.query(insertQuery);
    console.log(`✓ Pages menu item created: ${result.rows[0].title} (ID: ${result.rows[0].id})`);
    
  } catch (error) {
    console.error('Error adding pages menu item:', error);
    throw error;
  } finally {
    client.release();
  }
}

addPagesMenuItem()
  .then(() => {
    console.log('Pages menu item setup complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to setup pages menu item:', error);
    process.exit(1);
  });
