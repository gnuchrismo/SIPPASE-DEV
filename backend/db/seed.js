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
const bcrypt = require('bcryptjs');
const db = require('./index');

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seed...\n');

        // Check if admin user exists
        const checkUser = await db.query('SELECT id FROM users WHERE username = $1', ['admin']);

        if (checkUser.rows.length > 0) {
            console.log('ℹ️  Admin user already exists. ID:', checkUser.rows[0].id);
        } else {
            // Create default admin user
            const passwordHash = await bcrypt.hash('admin123', 10);
            const result = await db.query(
                `INSERT INTO users (username, email, password_hash, role, is_active) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, username, email, role`,
                ['admin', 'admin@sippase.gob.bo', passwordHash, 'admin', true]
            );

            console.log('✅ Admin user created successfully');
            console.log('   ID:', result.rows[0].id);
            console.log('   Username:', result.rows[0].username);
            console.log('   Password: admin123');
            console.log('   Email:', result.rows[0].email);
            console.log('   Role:', result.rows[0].role, '\n');
        }

        // Check and seed sliders
        const checkSliders = await db.query('SELECT COUNT(*) as count FROM sliders');
        const sliderCount = parseInt(checkSliders.rows[0].count);

        if (sliderCount === 0) {
            await db.query(`
        INSERT INTO sliders (title, description, image_url, link_url, display_order, is_active) VALUES
        ('RUV', 'Registro Único de Violencia', '/assets/svg/shield.svg', '#sistemas', 1, true),
        ('AVP', 'Acoso y Violencia Política', '/assets/svg/handshake.svg', '#sistemas', 2, true),
        ('SELLO', 'Sello Empresa Comprometida', '/assets/svg/badge.svg', '#sistemas', 3, true)
      `);
            console.log('✅ Sample sliders created (3)');
        } else {
            console.log(`ℹ️  ${sliderCount} sliders already exist. Skipping.`);
        }

        // Check and seed systems
        const checkSystems = await db.query('SELECT COUNT(*) as count FROM systems');
        const systemsCount = parseInt(checkSystems.rows[0].count);

        if (systemsCount === 0) {
            await db.query(`
        INSERT INTO systems (name, description, icon_url, url, manual_url, display_order) VALUES
        ('RUV', 'Sistema de registro y seguimiento de casos', '/assets/svg/shield.svg', 'https://ruv.sippase.gob.bo', '#documentos', 1),
        ('AVP', 'Plataforma para acoso político', '/assets/svg/handshake.svg', 'https://avp.sippase.gob.bo', '#documentos', 2),
        ('SELLO', 'Certificación empresarial', '/assets/svg/badge.svg', 'https://sello.sippase.gob.bo', '#documentos', 3)
      `);
            console.log('✅ Sample systems created (3)');
        } else {
            console.log(`ℹ️  ${systemsCount} systems already exist. Skipping.`);
        }

        console.log('\n🎉 Database seed completed successfully!\n');
        console.log('📝 You can now login with:');
        console.log('   Username: admin');
        console.log('   Password: admin123\n');

        await db.pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:');
        console.error('Error message:', error.message);
        if (error.code) console.error('Error code:', error.code);
        if (error.detail) console.error('Detail:', error.detail);

        await db.pool.end();
        process.exit(1);
    }
}

seedDatabase();
