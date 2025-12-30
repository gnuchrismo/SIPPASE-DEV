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

const alertsController = {
  // Get alerts for the current user
  getAlerts: async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 10, offset = 0, unreadOnly } = req.query;
      
      let query = `
        SELECT * FROM alerts 
        WHERE user_id = $1 
      `;
      
      const params = [userId];
      
      if (unreadOnly === 'true') {
        query += ` AND is_read = false`;
      }
      
      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      
      const result = await db.query(query, params);
      
      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) FROM alerts WHERE user_id = $1`;
      const countParams = [userId];
      
      if (unreadOnly === 'true') {
        countQuery += ` AND is_read = false`;
      }
      
      const countResult = await db.query(countQuery, countParams);
      
      // Get unread count specifically for the badge
      const unreadCountResult = await db.query(
        `SELECT COUNT(*) FROM alerts WHERE user_id = $1 AND is_read = false`,
        [userId]
      );
      
      res.json({
        alerts: result.rows,
        total: parseInt(countResult.rows[0].count),
        unreadCount: parseInt(unreadCountResult.rows[0].count)
      });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ message: 'Error fetching alerts' });
    }
  },

  // Mark an alert as read
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const result = await db.query(
        `UPDATE alerts SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
        [id, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Alert not found or unauthorized' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error marking alert as read:', error);
      res.status(500).json({ message: 'Error updating alert' });
    }
  },

  // Mark all alerts as read
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.id;
      
      await db.query(
        `UPDATE alerts SET is_read = true WHERE user_id = $1`,
        [userId]
      );
      
      res.json({ message: 'All alerts marked as read' });
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
      res.status(500).json({ message: 'Error updating alerts' });
    }
  },

  // Delete an alert
  deleteAlert: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const result = await db.query(
        `DELETE FROM alerts WHERE id = $1 AND user_id = $2 RETURNING *`,
        [id, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Alert not found or unauthorized' });
      }
      
      res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
      console.error('Error deleting alert:', error);
      res.status(500).json({ message: 'Error deleting alert' });
    }
  },
  
  // Create an alert (Internal use or Admin API)
  createAlert: async (req, res) => {
    try {
      // If called via API, ensure admin
      if (req.user && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const { user_id, type, title, message, link } = req.body;
      
      const result = await db.query(
        `INSERT INTO alerts (user_id, type, title, message, link) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [user_id, type, title, message, link]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating alert:', error);
      res.status(500).json({ message: 'Error creating alert' });
    }
  }
};

module.exports = alertsController;
