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
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'sippase_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

async function runBlogSchema() {
    const client = await pool.connect();
    try {
        console.log('Creating blog posts table...');
        const blogPostsSQL = fs.readFileSync(
            path.join(__dirname, 'create_blog_posts_table.sql'),
            'utf8'
        );
        await client.query(blogPostsSQL);
        console.log('✓ Blog posts table created successfully');

        console.log('Creating blog media table...');
        const blogMediaSQL = fs.readFileSync(
            path.join(__dirname, 'create_blog_media_table.sql'),
            'utf8'
        );
        await client.query(blogMediaSQL);
        console.log('✓ Blog media table created successfully');

        console.log('\n✅ Blog module database schema created successfully!');
    } catch (err) {
        console.error('Error creating blog schema:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

runBlogSchema();
