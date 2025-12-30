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
const fs = require('fs');
const path = require('path');

async function runPagesSchema() {
  const client = await pool.connect();
  try {
    console.log('Running pages schema...');
    
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'pages_schema.sql'),
      'utf8'
    );
    
    await client.query(schemaSQL);
    console.log('✓ Pages schema created successfully');
    
    // Verify the table was created
    const result = await client.query(`
      SELECT COUNT(*) as count FROM pages;
    `);
    console.log(`✓ Pages table has ${result.rows[0].count} records`);
    
  } catch (error) {
    console.error('Error running pages schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

runPagesSchema()
  .then(() => {
    console.log('Pages schema setup complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to setup pages schema:', error);
    process.exit(1);
  });
