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
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../db');
const emailService = require('../services/emailService');

/**
 * Request password reset - Generate token and send email
 */
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }

        // Find user by email
        const userResult = await db.query(
            'SELECT id, username, email FROM users WHERE email = $1',
            [email]
        );

        // Always return success even if user not found (security best practice)
        if (userResult.rows.length === 0) {
            return res.json({ 
                message: 'If that email exists, a reset link has been sent.' 
            });
        }

        const user = userResult.rows[0];

        // Generate secure random token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Save token to database
        await db.query(
            'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, token, expiresAt]
        );

        // Generate reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

        // Send email
        await emailService.sendPasswordResetEmail(user.email, user.username, token, resetUrl);

        res.json({ 
            message: 'If that email exists, a reset link has been sent.' 
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ error: 'Failed to process password reset request' });
    }
};

/**
 * Verify reset token validity
 */
exports.verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        const result = await db.query(`
            SELECT prt.*, u.username, u.email
            FROM password_reset_tokens prt
            INNER JOIN users u ON prt.user_id = u.id
            WHERE prt.token = $1 
              AND prt.expires_at > NOW()
              AND prt.used_at IS NULL
        `, [token]);

        if (result.rows.length === 0) {
            return res.status(400).json({ 
                error: 'Invalid or expired token',
                valid: false 
            });
        }

        res.json({
            valid: true,
            username: result.rows[0].username
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ error: 'Failed to verify token' });
    }
};

/**
 * Reset password with valid token
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token, new_password } = req.body;

        if (!token || !new_password) {
            return res.status(400).json({ error: 'Token and new password required' });
        }

        // Validate password strength
        if (new_password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        // Find valid token
        const tokenResult = await db.query(`
            SELECT prt.*, u.id as user_id, u.username, u.email
            FROM password_reset_tokens prt
            INNER JOIN users u ON prt.user_id = u.id
            WHERE prt.token = $1 
              AND prt.expires_at > NOW()
              AND prt.used_at IS NULL
        `, [token]);

        if (tokenResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const tokenData = tokenResult.rows[0];

        // Hash new password
        const passwordHash = await bcrypt.hash(new_password, 10);

        // Start transaction
        await db.query('BEGIN');

        try {
            // Update user password
            await db.query(
                'UPDATE users SET password_hash = $1 WHERE id = $2',
                [passwordHash, tokenData.user_id]
            );

            // Mark token as used
            await db.query(
                'UPDATE password_reset_tokens SET used_at = NOW() WHERE token = $1',
                [token]
            );

            await db.query('COMMIT');

            // Send confirmation email
            await emailService.sendPasswordChangedEmail(tokenData.email, tokenData.username);

            res.json({ message: 'Password reset successfully' });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

/**
 * Clean expired tokens (can be called by a cron job)
 */
exports.cleanExpiredTokens = async (req, res) => {
    try {
        const result = await db.query(`
            DELETE FROM password_reset_tokens
            WHERE expires_at < NOW() OR used_at IS NOT NULL
        `);

        res.json({
            message: 'Expired tokens cleaned',
            deletedCount: result.rowCount
        });
    } catch (error) {
        console.error('Token cleanup error:', error);
        res.status(500).json({ error: 'Failed to clean expired tokens' });
    }
};
