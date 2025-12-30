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
const db = require('./index');

async function seedAlerts() {
  try {
    console.log('Seeding alerts...');
    
    // Get the first user
    const userResult = await db.query('SELECT id FROM users LIMIT 1');
    
    const userId = userResult.rows[0].id;
    
    const alerts = [
      {
        user_id: userId,
        type: 'success',
        title: 'Sistema actualizado',
        message: 'El sistema se ha actualizado correctamente a la versión 2.0',
        link: null
      },
      {
        user_id: userId,
        type: 'info',
        title: 'Nuevo documento disponible',
        message: 'Se ha publicado un nuevo documento en la sección de recursos',
        link: '/admin/documents'
      },
      {
        user_id: userId,
        type: 'warning',
        title: 'Mantenimiento programado',
        message: 'El sistema estará en mantenimiento el próximo domingo de 2:00 AM a 6:00 AM',
        link: null
      },
      {
        user_id: userId,
        type: 'error',
        title: 'Error en sincronización',
        message: 'Hubo un error al sincronizar los datos. Por favor, revise el registro de auditoría',
        link: '/admin/audit-logs'
      },
      {
        user_id: userId,
        type: 'info',
        title: 'Nuevo mensaje de contacto',
        message: 'Ha recibido un nuevo mensaje de contacto que requiere atención',
        link: '/admin/messages'
      },
      {
        user_id: userId,
        type: 'success',
        title: 'Backup completado',
        message: 'La copia de seguridad automática se completó exitosamente',
        link: null
      },
      {
        user_id: userId,
        type: 'warning',
        title: 'Espacio en disco bajo',
        message: 'El espacio en disco del servidor está por debajo del 20%',
        link: null
      }
    ];
    
    for (const alert of alerts) {
      await db.query(
        `INSERT INTO alerts (user_id, type, title, message, link) 
         VALUES ($1, $2, $3, $4, $5)`,
        [alert.user_id, alert.type, alert.title, alert.message, alert.link]
      );
    }
    
    console.log(`✅ Successfully seeded ${alerts.length} alerts`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding alerts:', error);
    process.exit(1);
  }
}

seedAlerts();
