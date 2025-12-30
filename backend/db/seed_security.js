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

        // ==============================================
        // 1. SEED ROLES
        // ==============================================
        console.log('👥 Seeding roles...');
        const roles = [
            { name: 'admin', description: 'Full system access', is_system: true },
            { name: 'editor', description: 'Can create and edit content', is_system: true },
            { name: 'viewer', description: 'Read-only access', is_system: true }
        ];

        for (const role of roles) {
            await db.query(
                `INSERT INTO roles (name, description, is_system_role) 
                 VALUES ($1, $2, $3) 
                 ON CONFLICT (name) DO NOTHING`,
                [role.name, role.description, role.is_system]
            );
        }
        console.log('✅ Roles seeded (3 system roles)\n');

        // ==============================================
        // 2. SEED PERMISSIONS
        // ==============================================
        console.log('🔑 Seeding permissions...');
        const modules = ['sliders', 'systems', 'documents', 'statistics', 'users', 'contacts', 'roles', 'audit_logs'];
        const actions = ['create', 'read', 'update', 'delete'];
        
        let permissionCount = 0;
        for (const module of modules) {
            for (const action of actions) {
                await db.query(
                    `INSERT INTO permissions (module, action, name, description) 
                     VALUES ($1, $2, $3, $4) 
                     ON CONFLICT (name) DO NOTHING`,
                    [module, action, `${module}.${action}`, `Can ${action} ${module}`]
                );
                permissionCount++;
            }
        }
        console.log(`✅ Permissions seeded (${permissionCount} permissions)\n`);

        // ==============================================
        // 3. ASSIGN PERMISSIONS TO ROLES
        // ==============================================
        console.log('🔗 Assigning permissions to roles...');

        // Get role IDs
        const adminRole = await db.query(`SELECT id FROM roles WHERE name = 'admin'`);
        const editorRole = await db.query(`SELECT id FROM roles WHERE name = 'editor'`);
        const viewerRole = await db.query(`SELECT id FROM roles WHERE name = 'viewer'`);

        // Admin gets all permissions
        const allPermissions = await db.query(`SELECT id FROM permissions`);
        for (const perm of allPermissions.rows) {
            await db.query(
                `INSERT INTO role_permissions (role_id, permission_id) 
                 VALUES ($1, $2) 
                 ON CONFLICT (role_id, permission_id) DO NOTHING`,
                [adminRole.rows[0].id, perm.id]
            );
        }

        // Editor gets create, read, update for content modules (not users, roles, audit_logs)
        const editorPermissions = await db.query(
            `SELECT id FROM permissions 
             WHERE module IN ('sliders', 'systems', 'documents', 'statistics', 'contacts') 
             AND action IN ('create', 'read', 'update')`
        );
        for (const perm of editorPermissions.rows) {
            await db.query(
                `INSERT INTO role_permissions (role_id, permission_id) 
                 VALUES ($1, $2) 
                 ON CONFLICT (role_id, permission_id) DO NOTHING`,
                [editorRole.rows[0].id, perm.id]
            );
        }

        // Viewer gets only read permissions
        const viewerPermissions = await db.query(
            `SELECT id FROM permissions WHERE action = 'read'`
        );
        for (const perm of viewerPermissions.rows) {
            await db.query(
                `INSERT INTO role_permissions (role_id, permission_id) 
                 VALUES ($1, $2) 
                 ON CONFLICT (role_id, permission_id) DO NOTHING`,
                [viewerRole.rows[0].id, perm.id]
            );
        }

        console.log('✅ Permissions assigned to roles\n');

        // ==============================================
        // 4. CREATE DEFAULT ADMIN USER
        // ==============================================
        console.log('👤 Seeding users...');
        const checkUser = await db.query('SELECT id FROM users WHERE username = $1', ['admin']);

        if (checkUser.rows.length > 0) {
            console.log('ℹ️  Admin user already exists. ID:', checkUser.rows[0].id);
            
            // Ensure admin has admin role
            await db.query(
                `INSERT INTO user_roles (user_id, role_id) 
                 VALUES ($1, $2) 
                 ON CONFLICT (user_id, role_id) DO NOTHING`,
                [checkUser.rows[0].id, adminRole.rows[0].id]
            );
        } else {
            const passwordHash = await bcrypt.hash('admin123', 10);
            const result = await db.query(
                `INSERT INTO users (username, email, password_hash, is_active) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING id, username, email`,
                ['admin', 'admin@sippase.gob.bo', passwordHash, true]
            );

            console.log('✅ Admin user created successfully');
            console.log('   ID:', result.rows[0].id);
            console.log('   Username:', result.rows[0].username);
            console.log('   Password: admin123');
            console.log('   Email:', result.rows[0].email);

            // Assign admin role to admin user
            await db.query(
                `INSERT INTO user_roles (user_id, role_id) 
                 VALUES ($1, $2)`,
                [result.rows[0].id, adminRole.rows[0].id]
            );
            console.log('   ✅ Admin role assigned\n');
        }

        // ==============================================
        // 5. SEED SAMPLE CONTENT (if needed)
        // ==============================================
        
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
        console.log('   Password: admin123');
        console.log('\n🔐 RBAC System initialized with:');
        console.log('   • 3 system roles (admin, editor, viewer)');
        console.log('   • Granular permissions for all modules');
        console.log('   • Admin user with full permissions\n');

        await db.pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:');
        console.error('Error message:', error.message);
        if (error.code) console.error('Error code:', error.code);
        if (error.detail) console.error('Detail:', error.detail);
        if (error.stack) console.error('Stack:', error.stack);

        await db.pool.end();
        process.exit(1);
    }
}

seedDatabase();
