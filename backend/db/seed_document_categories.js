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

const categories = [
    {
        name: 'Manual de Usuario',
        description: '<p>Manuales y guías de usuario de los sistemas institucionales. Documentos técnicos y operativos para el uso correcto de las plataformas.</p>',
        icon: 'menu_book',
        display_order: 1
    },
    {
        name: 'Normativa Legal',
        description: '<p>Leyes, decretos, resoluciones y normativas legales aplicables al ámbito institucional y de violencia contra la mujer.</p>',
        icon: 'gavel',
        display_order: 2
    },
    {
        name: 'Capacitación',
        description: '<p>Material de capacitación, presentaciones, videos y recursos formativos para el personal y usuarios.</p>',
        icon: 'school',
        display_order: 3
    },
    {
        name: 'Formularios',
        description: '<p>Formularios, plantillas y documentos tipo para procesos administrativos y de atención.</p>',
        icon: 'description',
        display_order: 4
    },
    {
        name: 'Informes',
        description: '<p>Informes institucionales, reportes estadísticos y documentos de seguimiento.</p>',
        icon: 'assessment',
        display_order: 5
    },
    {
        name: 'Otros',
        description: '<p>Otros documentos y recursos institucionales que no se clasifican en las categorías anteriores.</p>',
        icon: 'folder',
        display_order: 6
    }
];

async function seedDocumentCategories() {
    try {
        console.log('🌱 Seeding document categories...');

        for (const category of categories) {
            const existing = await db.query(
                'SELECT id FROM document_categories WHERE name = $1',
                [category.name]
            );

            if (existing.rows.length === 0) {
                await db.query(
                    'INSERT INTO document_categories (name, description, icon, display_order, is_active) VALUES ($1, $2, $3, $4, $5)',
                    [category.name, category.description, category.icon, category.display_order, true]
                );
                console.log(`✅ Created category: ${category.name}`);
            } else {
                console.log(`⏭️  Category already exists: ${category.name}`);
            }
        }

        console.log('✅ Document categories seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding document categories:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    seedDocumentCategories()
        .then(() => {
            console.log('Done!');
            process.exit(0);
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = seedDocumentCategories;
