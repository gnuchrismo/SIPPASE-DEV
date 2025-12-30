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
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE
});

// Import complaints from Excel
exports.importComplaints = async (req, res) => {
  const client = await pool.connect();
  try {
    const { complaints } = req.body;
    
    if (!complaints || !Array.isArray(complaints)) {
      return res.status(400).json({ error: 'Invalid data format. Expected an array of complaints.' });
    }

    await client.query('BEGIN');
    
    // 1. Clear existing data
    await client.query('DELETE FROM complaints');
    
    // 2. Insert new data
    const insertQuery = `
      INSERT INTO complaints (
        correlativo, gestion, fecha_denuncia, fecha_hecho, fecha_registro,
        departamento, municipio, slim,
        victima_nombre, victima_edad, victima_genero,
        victima_embarazo, victima_poblacion_vulnerable, victima_autoidentificacion,
        victima_hijos, victima_dependientes,
        tipologia_principal, tipologia_secundaria,
        agresor_nombre, genero_denunciados, relacion_agresor,
        edad_denunciado, tipo_denunciado,
        asistencia_familiar, tipo_denunciante, estado_caso
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
    `;
    
    let imported = 0;
    for (const c of complaints) {
      // Helper to parse dates or return null (if incoherent)
      const parseDate = (d) => {
        if (!d) return null;
        const date = new Date(d);
        return isNaN(date.getTime()) ? null : d;
      };

      // Helper for numeric defaults (0 if null/invalid)
      const parseIntDefault = (v) => {
        const parsed = parseInt(v);
        return isNaN(parsed) ? 0 : parsed;
      };

      // Helper for text defaults ("No registrado" if empty)
      const parseTextDefault = (v) => {
        return (v && v.toString().trim() !== '') ? v.toString().trim() : 'No registrado';
      };

      await client.query(insertQuery, [
        parseTextDefault(c.correlativo),
        parseIntDefault(c.gestion),
        parseDate(c.fecha_denuncia),
        parseDate(c.fecha_hecho),
        parseDate(c.fecha_registro),
        parseTextDefault(c.departamento),
        parseTextDefault(c.municipio),
        parseTextDefault(c.slim),
        parseTextDefault(c.victima_nombre),
        parseIntDefault(c.victima_edad),
        parseTextDefault(c.victima_genero),
        parseTextDefault(c.victima_embarazo),
        parseTextDefault(c.victima_poblacion_vulnerable),
        parseTextDefault(c.victima_autoidentificacion),
        parseIntDefault(c.victima_hijos),
        parseIntDefault(c.victima_dependientes),
        parseTextDefault(c.tipologia_principal),
        parseTextDefault(c.tipologia_secundaria),
        parseTextDefault(c.agresor_nombre),
        parseTextDefault(c.genero_denunciados),
        parseTextDefault(c.relacion_agresor),
        parseIntDefault(c.edad_denunciado),
        parseTextDefault(c.tipo_denunciado),
        parseTextDefault(c.asistencia_familiar),
        parseTextDefault(c.tipo_denunciante),
        parseTextDefault(c.estado_caso)
      ]);
      imported++;
    }
    
    // 3. Refresh Statistics View
    await client.query('SELECT refresh_complaints_stats()');

    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: `${imported} denuncias importadas correctamente`,
      total: imported
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error importing complaints:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// Get paginated complaints
exports.getComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM complaints';
    let countQuery = 'SELECT COUNT(*) FROM complaints';
    let params = [];
    
    if (search) {
      const searchCondition = `
        WHERE 
          correlativo ILIKE $1 OR 
          victima_nombre ILIKE $1 OR 
          departamento ILIKE $1 OR 
          municipio ILIKE $1
      `;
      query += searchCondition;
      countQuery += searchCondition;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    
    const result = await pool.query(query, [...params, limit, offset]);
    const countResult = await pool.query(countQuery, params);
    
    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error getting complaints:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get statistics calculated dynamically
exports.getStatistics = async (req, res) => {
  try {
    const { year, violence_type } = req.query;
    const stats = [];

    // Helper to build WHERE clause
    const buildWhere = (baseParams = []) => {
      let clause = ' WHERE 1=1';
      const params = [...baseParams];
      let idx = params.length + 1;

      if (year) {
        clause += ` AND gestion = $${idx}`;
        params.push(parseInt(year));
        idx++;
      }

      if (violence_type) {
        clause += ` AND tipologia_principal = $${idx}`;
        params.push(violence_type);
        idx++;
      }

      return { clause, params };
    };

    const { clause: whereClause, params: queryParams } = buildWhere();

    // --- 1. Estadísticas Generales ---
    const totalCountResult = await pool.query(`SELECT SUM(count_by_gestion) as total FROM complaints_stats_mv ${whereClause}`, queryParams);
    const total = parseInt(totalCountResult.rows[0].total) || 0;
    stats.push({ category: 'General', label: 'Total Casos', value: total, period: 'Historico' });

    // Last Import Date (Not filtered generally, but we keep it static or filter? Keep static as system info)
    const lastImportResult = await pool.query('SELECT MAX(created_at) as last_import FROM complaints');
    if (lastImportResult.rows[0].last_import) {
        const date = new Date(lastImportResult.rows[0].last_import);
        stats.push({ 
            category: 'General', 
            label: 'Última Importación', 
            value: date.toLocaleString('es-BO'), 
            period: 'Sistema' 
        });
    }

    // Casos por Año
    const yearlyResult = await pool.query(`SELECT gestion, SUM(count_by_gestion) as total FROM complaints_stats_mv ${whereClause} GROUP BY gestion ORDER BY gestion`, queryParams);
    yearlyResult.rows.forEach(row => {
        if(row.gestion) stats.push({ category: 'Casos por Año', label: row.gestion.toString(), value: parseInt(row.total), period: row.gestion.toString() });
    });

    // Tendencia Mensual
    // Note: We need to filter 'month_year IS NOT NULL' as well
    const { clause: monthlywc, params: monthlyParams } = buildWhere();
    // monthlywc already starts with " WHERE 1=1"
    const monthlyQuery = `SELECT month_year, SUM(count_by_gestion) as total FROM complaints_stats_mv ${monthlywc} AND month_year IS NOT NULL GROUP BY month_year ORDER BY month_year`;
    const monthlyResult = await pool.query(monthlyQuery, monthlyParams);
    monthlyResult.rows.forEach(row => {
        stats.push({ category: 'Tendencia Mensual', label: row.month_year, value: parseInt(row.total), period: row.month_year });
    });

    // --- 2. Estadísticas Geográficas ---
    // --- 2. Estadísticas Geográficas ---
    // Update: Get Top Typology per Dept
    // We use a separate aggregation to avoid complex window functions if not supported, or just do it in JS if dataset small.
    // Given potential large dataset, better SQL. using DISTINCT ON or CTE. assuming Postgres.
    // Let's use a simpler approach compatible with most SQL: correlated subquery or just fetch all (dept, type, count) and process in JS?
    // Processing in JS is safer for compatibility if we are unsure of DB specific features enabled (like CTEs).
    // Fetch top typology for each department.
    const deptTypologyResult = await pool.query(`
        SELECT departamento, tipologia_principal, SUM(count_by_gestion) as total 
        FROM complaints_stats_mv ${whereClause} 
        AND departamento IS NOT NULL AND tipologia_principal IS NOT NULL
        GROUP BY departamento, tipologia_principal 
        ORDER BY departamento, total DESC
    `, queryParams);

    // Map: Dept -> Top Typology Object
    const deptTopMap = {};
    deptTypologyResult.rows.forEach(row => {
        if (!deptTopMap[row.departamento]) {
            deptTopMap[row.departamento] = { label: row.tipologia_principal, value: parseInt(row.total) };
        }
    });

    const deptResult = await pool.query(`SELECT departamento, SUM(count_by_gestion) as total FROM complaints_stats_mv ${whereClause} GROUP BY departamento ORDER BY total DESC`, queryParams);
    deptResult.rows.forEach(row => {
        if(row.departamento) {
            const topMeta = deptTopMap[row.departamento];
            stats.push({ 
                category: 'Por Departamento', 
                label: row.departamento, 
                value: parseInt(row.total), 
                period: 'Historico',
                top_meta_label: topMeta ? topMeta.label : null,
                top_meta_value: topMeta ? topMeta.value : null
            });
        }
    });

    const muniResult = await pool.query(`SELECT municipio, SUM(count_by_gestion) as total FROM complaints_stats_mv ${whereClause} GROUP BY municipio ORDER BY total DESC LIMIT 10`, queryParams);
    muniResult.rows.forEach(row => {
        if(row.municipio) stats.push({ category: 'Top Municipios', label: row.municipio, value: parseInt(row.total), period: 'Historico' });
    });

    // --- 3. Tipologías ---
    // Fetch Top Dept per Typology
    const typeDeptResult = await pool.query(`
        SELECT tipologia_principal, departamento, SUM(count_by_gestion) as total 
        FROM complaints_stats_mv ${whereClause} 
        AND tipologia_principal IS NOT NULL AND departamento IS NOT NULL
        GROUP BY tipologia_principal, departamento 
        ORDER BY tipologia_principal, total DESC
    `, queryParams);

    const typeTopMap = {};
    typeDeptResult.rows.forEach(row => {
         if (!typeTopMap[row.tipologia_principal]) {
            typeTopMap[row.tipologia_principal] = { label: row.departamento, value: parseInt(row.total) };
        }
    });

    // Filter out null typology
    const { clause: typewc, params: typeParams } = buildWhere();
    const typeQuery = `SELECT tipologia_principal, SUM(count_by_gestion) as total FROM complaints_stats_mv ${typewc} AND tipologia_principal IS NOT NULL GROUP BY tipologia_principal ORDER BY total DESC`;
    const tipoResult = await pool.query(typeQuery, typeParams);
    tipoResult.rows.forEach(row => {
        const topMeta = typeTopMap[row.tipologia_principal];
        stats.push({ 
            category: 'Tipología Principal', 
            label: row.tipologia_principal, 
            value: parseInt(row.total), 
            period: 'Historico',
            top_meta_label: topMeta ? topMeta.label : null, // The top department for this type
            top_meta_value: topMeta ? topMeta.value : null 
        });
    });

    // --- 4. Víctimas ---
    // Edad (Grouped in MV as age_group)
    const ageResult = await pool.query(`SELECT age_group, SUM(count_by_gestion) as total FROM complaints_stats_mv ${whereClause} GROUP BY age_group`, queryParams);
    ageResult.rows.forEach(row => {
        stats.push({ category: 'Edad Víctima', label: row.age_group, value: parseInt(row.total), period: 'Historico' });
    });

    // --- 5. Denunciados ---
    // Género
    const { clause: genwc, params: genParams } = buildWhere();
    const genQuery = `SELECT genero_denunciados, SUM(count_by_gestion) as total FROM complaints_stats_mv ${genwc} AND genero_denunciados IS NOT NULL GROUP BY genero_denunciados`;
    const agresorGeneroResult = await pool.query(genQuery, genParams);
    agresorGeneroResult.rows.forEach(row => {
        stats.push({ category: 'Género Agresor', label: row.genero_denunciados, value: parseInt(row.total), period: 'Historico' });
    });

    // Relación
    const { clause: relwc, params: relParams } = buildWhere();
    const relQuery = `SELECT relacion_agresor, SUM(count_by_gestion) as total FROM complaints_stats_mv ${relwc} AND relacion_agresor IS NOT NULL GROUP BY relacion_agresor ORDER BY total DESC`;
    const relacionResult = await pool.query(relQuery, relParams);
    relacionResult.rows.forEach(row => {
        stats.push({ category: 'Relación Agresor', label: row.relacion_agresor, value: parseInt(row.total), period: 'Historico' });
    });

    res.json(stats);
  } catch (error) {
    console.error('Error generating statistics:', error);
    res.status(500).json({ error: error.message });
  }
};
