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
const pool = require('../db');

// Get all messages with pagination and filters (Admin)
const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const offset = (page - 1) * limit;
    
    // Use LEFT JOIN to include system information
    let query = `
      SELECT 
        cm.*,
        s.name as system_name,
        s.id as system_id
      FROM contact_messages cm
      LEFT JOIN systems s ON cm.system_id = s.id
    `;
    const params = [];
    
    if (status === 'unread') {
      query += ' WHERE cm.is_read = FALSE AND cm.is_archived = FALSE';
    } else if (status === 'archived') {
      query += ' WHERE cm.is_archived = TRUE';
    } else {
      query += ' WHERE cm.is_archived = FALSE';
    }
    
    query += ' ORDER BY cm.created_at DESC LIMIT $1 OFFSET $2';
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM contact_messages cm';
    if (status === 'unread') {
      countQuery += ' WHERE cm.is_read = FALSE AND cm.is_archived = FALSE';
    } else if (status === 'archived') {
      countQuery += ' WHERE cm.is_archived = TRUE';
    } else {
      countQuery += ' WHERE cm.is_archived = FALSE';
    }
    
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      messages: result.rows,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit contact message (Public endpoint)
const submitMessage = async (req, res) => {
  try {
    const { name, email, phone, message, system_id } = req.body;
    
    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        message: 'Nombre, email y mensaje son requeridos' 
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Email inválido' 
      });
    }
    
    // Insert message
    const query = `
      INSERT INTO contact_messages (name, email, phone, message, system_id, is_read, is_archived)
      VALUES ($1, $2, $3, $4, $5, FALSE, FALSE)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name.trim(),
      email.trim().toLowerCase(),
      phone ? phone.trim() : null,
      message.trim(),
      system_id || null
    ]);
    
    res.status(201).json({
      message: 'Mensaje enviado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error submitting message:', error);
    res.status(500).json({ message: 'Error al enviar mensaje' });
  }
};

// Mark message as read/unread
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read } = req.body;
    
    const result = await pool.query(
      'UPDATE contact_messages SET is_read = $1 WHERE id = $2 RETURNING *',
      [is_read, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Archive/Unarchive message
const toggleArchive = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_archived } = req.body;
    
    const result = await pool.query(
      'UPDATE contact_messages SET is_archived = $1 WHERE id = $2 RETURNING *',
      [is_archived, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error archiving message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM contact_messages WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reply to message (Placeholder for email integration)
const replyMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyContent } = req.body;
    
    // Here you would integrate with nodemailer or similar
    console.log(`Replying to message ${id} with content: ${replyContent}`);
    
    res.json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Error replying to message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMessages,
  submitMessage,
  markAsRead,
  toggleArchive,
  deleteMessage,
  replyMessage
};
