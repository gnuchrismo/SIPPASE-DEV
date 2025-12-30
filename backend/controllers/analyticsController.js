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
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

/**
 * Endpoint público para rastrear visualizaciones de páginas
 * No requiere autenticación ya que es llamado desde el frontend público
 */
exports.trackPageView = async (req, res) => {
  try {
    const { url, pageTitle, referrer, sessionId } = req.body;
    
    // Validar datos requeridos
    if (!url || !sessionId) {
      return res.status(400).json({ error: 'URL and sessionId are required' });
    }
    
    const userAgent = req.headers['user-agent'] || '';
    // Obtener IP real considerando proxies
    let ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                      req.headers['x-real-ip'] || 
                      req.ip || 
                      req.connection.remoteAddress || 
                      '127.0.0.1'; // Default safe fallback

    // Si estamos en desarrollo (o sin definir) y es localhost, usar una IP de Bolivia para pruebas
    const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    if (isDev && (ipAddress === '::1' || ipAddress === '127.0.0.1')) {
      ipAddress = '200.87.144.1'; // IP pública de ejemplo (Bolivia)
      console.log('[Analytics] Using mock IP for localhost:', ipAddress);
    }
    
    // Parse user agent para obtener información del dispositivo
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();
    
    // Obtener geolocalización desde IP (Safe lookup)
    let geo = null;
    try {
        if (ipAddress && ipAddress !== '127.0.0.1' && ipAddress !== '::1') {
            geo = geoip.lookup(ipAddress);
        }
    } catch (e) {
        console.warn('[Analytics] GeoIP lookup failed:', e.message);
    }
    
    // Detectar tipo de dispositivo
    let deviceType = 'desktop';
    if (uaResult.device && uaResult.device.type === 'mobile') deviceType = 'mobile';
    else if (uaResult.device && uaResult.device.type === 'tablet') deviceType = 'tablet';
    
    // Detectar bots
    const botPatterns = /bot|crawler|spider|crawling|scraper|slurp|archiver|monitoring|fetch/i;
    const isBot = botPatterns.test(userAgent);
    
    // Insertar visita a la página
    await db.query(`
      INSERT INTO page_visits 
      (url, page_title, referrer, user_agent, ip_address, country, device_type, browser, os, session_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      url.substring(0, 500),
      pageTitle?.substring(0, 200) || null,
      referrer?.substring(0, 500) || null,
      userAgent.substring(0, 1000),
      ipAddress,
      geo?.country || 'XX',
      deviceType,
      uaResult.browser?.name?.substring(0, 50) || 'Unknown',
      uaResult.os?.name?.substring(0, 50) || 'Unknown',
      sessionId
    ]);
    
    // Actualizar o crear sesión
    await db.query(`
      INSERT INTO visitor_sessions (session_id, ip_address, user_agent, is_bot, last_activity, total_pageviews)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 1)
      ON CONFLICT (session_id) 
      DO UPDATE SET 
        last_activity = CURRENT_TIMESTAMP,
        total_pageviews = visitor_sessions.total_pageviews + 1
    `, [sessionId, ipAddress, userAgent, isBot]);
    
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    // No fallar silenciosamente para no interrumpir la experiencia del usuario, pero loguear bien
    res.status(200).json({ success: false, error: 'Internal tracking error' }); // Return 200 to not block client
  }
};

/**
 * Obtener estadísticas de analytics
 * Requiere autenticación de administrador
 */
exports.getStats = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Determinar número de días según el período
    let days = 7;
    if (period === '30d') days = 30;
    else if (period === '90d') days = 90;
    else if (period === '1d') days = 1;
    
    // Obtener estadísticas resumidas
    const summaryResult = await db.query(`
      SELECT 
        COUNT(*) as total_visits,
        COUNT(DISTINCT pv.session_id) as unique_visitors,
        COUNT(DISTINCT DATE(pv.visited_at)) as active_days,
        COUNT(DISTINCT pv.url) as unique_pages
      FROM page_visits pv
      LEFT JOIN visitor_sessions vs ON pv.session_id = vs.session_id
      WHERE pv.visited_at >= NOW() - INTERVAL '${days} days'
        AND (vs.is_bot = FALSE OR vs.is_bot IS NULL)
    `);
    
    // Top páginas más visitadas
    const topPagesResult = await db.query(`
      SELECT 
        pv.url,
        COUNT(*) as views,
        COUNT(DISTINCT pv.session_id) as unique_views,
        pv.page_title
      FROM page_visits pv
      LEFT JOIN visitor_sessions vs ON pv.session_id = vs.session_id
      WHERE pv.visited_at >= NOW() - INTERVAL '${days} days'
        AND (vs.is_bot = FALSE OR vs.is_bot IS NULL)
      GROUP BY pv.url, pv.page_title
      ORDER BY views DESC
      LIMIT 10
    `);
    
    // Tendencia de visitas por día
    const trendsResult = await db.query(`
      SELECT 
        DATE(pv.visited_at) as date,
        COUNT(*) as visits,
        COUNT(DISTINCT pv.session_id) as unique_visitors
      FROM page_visits pv
      LEFT JOIN visitor_sessions vs ON pv.session_id = vs.session_id
      WHERE pv.visited_at >= NOW() - INTERVAL '${days} days'
        AND (vs.is_bot = FALSE OR vs.is_bot IS NULL)
      GROUP BY DATE(pv.visited_at)
      ORDER BY date ASC
    `);
    
    // Distribución por tipo de dispositivo
    const devicesResult = await db.query(`
      SELECT 
        pv.device_type,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM page_visits pv
      LEFT JOIN visitor_sessions vs ON pv.session_id = vs.session_id
      WHERE pv.visited_at >= NOW() - INTERVAL '${days} days'
        AND (vs.is_bot = FALSE OR vs.is_bot IS NULL)
      GROUP BY pv.device_type
      ORDER BY count DESC
    `);
    
    // Top navegadores
    const browsersResult = await db.query(`
      SELECT 
        pv.browser,
        COUNT(*) as count
      FROM page_visits pv
      LEFT JOIN visitor_sessions vs ON pv.session_id = vs.session_id
      WHERE pv.visited_at >= NOW() - INTERVAL '${days} days'
        AND (vs.is_bot = FALSE OR vs.is_bot IS NULL)
        AND pv.browser != 'Unknown'
      GROUP BY pv.browser
      ORDER BY count DESC
      LIMIT 5
    `);
    
    // Top países
    const countriesResult = await db.query(`
      SELECT 
        pv.country,
        COUNT(*) as count
      FROM page_visits pv
      LEFT JOIN visitor_sessions vs ON pv.session_id = vs.session_id
      WHERE pv.visited_at >= NOW() - INTERVAL '${days} days'
        AND (vs.is_bot = FALSE OR vs.is_bot IS NULL)
        AND pv.country != 'XX'
      GROUP BY pv.country
      ORDER BY count DESC
      LIMIT 10
    `);
    
    // Top referrers (fuentes de tráfico)
    const referrersResult = await db.query(`
      SELECT 
        CASE 
          WHEN pv.referrer IS NULL OR pv.referrer = '' THEN 'Direct'
          ELSE pv.referrer
        END as referrer,
        COUNT(*) as count
      FROM page_visits pv
      LEFT JOIN visitor_sessions vs ON pv.session_id = vs.session_id
      WHERE pv.visited_at >= NOW() - INTERVAL '${days} days'
        AND (vs.is_bot = FALSE OR vs.is_bot IS NULL)
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 10
    `);
    
    res.json({
      period: period,
      summary: summaryResult.rows[0] || {},
      topPages: topPagesResult.rows || [],
      trends: trendsResult.rows || [],
      devices: devicesResult.rows || [],
      browsers: browsersResult.rows || [],
      countries: countriesResult.rows || [],
      referrers: referrersResult.rows || []
    });
  } catch (error) {
    console.error('Error getting analytics stats:', error);
    res.status(500).json({ error: 'Error retrieving analytics statistics' });
  }
};

/**
 * Limpiar datos antiguos de analytics (función de mantenimiento)
 * Elimina datos de más de X días para mantener la base de datos optimizada
 */
exports.cleanOldData = async (req, res) => {
  try {
    const { daysToKeep = 90 } = req.body;
    
    // Eliminar visitas antiguas
    const deleteResult = await db.query(`
      DELETE FROM page_visits
      WHERE visited_at < NOW() - INTERVAL '${parseInt(daysToKeep)} days'
    `);
    
    // Eliminar sesiones antiguas sin actividad
    await db.query(`
      DELETE FROM visitor_sessions
      WHERE last_activity < NOW() - INTERVAL '${parseInt(daysToKeep)} days'
    `);
    
    res.json({
      success: true,
      deletedRecords: deleteResult.rowCount,
      message: `Deleted records older than ${daysToKeep} days`
    });
  } catch (error) {
    console.error('Error cleaning old analytics data:', error);
    res.status(500).json({ error: 'Error cleaning old data' });
  }
};
