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
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const db = require('../db');
const bcrypt = require('bcryptjs');

/**
 * Setup 2FA for user - Generate secret and QR code
 */
exports.setup2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const username = req.user.username;

        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `SIPPASE Portal (${username})`,
            length: 32
        });

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        // Store temporarily (not enabled yet)
        await db.query(
            'UPDATE users SET two_factor_secret = $1 WHERE id = $2',
            [secret.base32, userId]
        );

        res.json({
            secret: secret.base32,
            qrCode: qrCodeUrl,
            otpauth_url: secret.otpauth_url
        });
    } catch (error) {
        console.error('2FA setup error:', error);
        res.status(500).json({ error: 'Failed to setup 2FA' });
    }
};

/**
 * Verify 2FA setup and enable it
 */
exports.verify2FASetup = async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token required' });
        }

        // Get user's secret
        const userResult = await db.query(
            'SELECT two_factor_secret FROM users WHERE id = $1',
            [userId]
        );

        if (!userResult.rows[0]?.two_factor_secret) {
            return res.status(400).json({ error: '2FA not set up. Call /setup first.' });
        }

        const secret = userResult.rows[0].two_factor_secret;

        // Verify token
        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 2 // Allow 2 time steps before/after
        });

        if (!verified) {
            return res.status(400).json({ error: 'Invalid token' });
        }

        // Generate backup codes
        const backupCodes = [];
        for (let i = 0; i < 10; i++) {
            const code = speakeasy.generateSecret({ length: 10 }).base32.substring(0, 8);
            backupCodes.push(code);
        }

        // Hash backup codes
        const hashedBackupCodes = await Promise.all(
            backupCodes.map(code => bcrypt.hash(code, 10))
        );

        // Enable 2FA and store backup codes
        await db.query(
            `UPDATE users 
             SET two_factor_enabled = TRUE,
                 backup_codes = $1
             WHERE id = $2`,
            [JSON.stringify(hashedBackupCodes), userId]
        );

        res.json({
            message: '2FA enabled successfully',
            backupCodes // Show once, user must save them
        });
    } catch (error) {
        console.error('2FA verification error:', error);
        res.status(500).json({ error: 'Failed to verify 2FA' });
    }
};

/**
 * Verify 2FA token during login
 */
exports.verify2FA = async (req, res) => {
    try {
        const { userId, token, useBackupCode } = req.body;

        if (!userId || !token) {
            return res.status(400).json({ error: 'User ID and token required' });
        }

        // Get user's 2FA settings
        const userResult = await db.query(
            'SELECT two_factor_secret, two_factor_enabled, backup_codes FROM users WHERE id = $1',
            [userId]
        );

        const user = userResult.rows[0];

        if (!user || !user.two_factor_enabled) {
            return res.status(400).json({ error: '2FA not enabled for this user' });
        }

        let verified = false;

        if (useBackupCode) {
            // Verify backup code
            const backupCodes = JSON.parse(user.backup_codes || '[]');
            
            for (let i = 0; i < backupCodes.length; i++) {
                const isValid = await bcrypt.compare(token, backupCodes[i]);
                if (isValid) {
                    // Remove used backup code
                    backupCodes.splice(i, 1);
                    await db.query(
                        'UPDATE users SET backup_codes = $1 WHERE id = $2',
                        [JSON.stringify(backupCodes), userId]
                    );
                    verified = true;
                    break;
                }
            }
        } else {
            // Verify TOTP token
            verified = speakeasy.totp.verify({
                secret: user.two_factor_secret,
                encoding: 'base32',
                token,
                window: 2
            });
        }

        if (!verified) {
            return res.status(400).json({ error: 'Invalid token or backup code' });
        }

        res.json({ verified: true });
    } catch (error) {
        console.error('2FA verification error:', error);
        res.status(500).json({ error: 'Failed to verify 2FA' });
    }
};

/**
 * Disable 2FA
 */
exports.disable2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password required' });
        }

        // Verify password
        const userResult = await db.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [userId]
        );

        const validPassword = await bcrypt.compare(password, userResult.rows[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Disable 2FA
        await db.query(
            `UPDATE users 
             SET two_factor_enabled = FALSE,
                 two_factor_secret = NULL,
                 backup_codes = NULL
             WHERE id = $1`,
            [userId]
        );

        res.json({ message: '2FA disabled successfully' });
    } catch (error) {
        console.error('2FA disable error:', error);
        res.status(500).json({ error: 'Failed to disable 2FA' });
    }
};

/**
 * Regenerate backup codes
 */
exports.regenerateBackupCodes = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password required' });
        }

        // Verify password
        const userResult = await db.query(
            'SELECT password_hash, two_factor_enabled FROM users WHERE id = $1',
            [userId]
        );

        const user = userResult.rows[0];

        if (!user.two_factor_enabled) {
            return res.status(400).json({ error: '2FA not enabled' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate new backup codes
        const backupCodes = [];
        for (let i = 0; i < 10; i++) {
            const code = speakeasy.generateSecret({ length: 10 }).base32.substring(0, 8);
            backupCodes.push(code);
        }

        // Hash backup codes
        const hashedBackupCodes = await Promise.all(
            backupCodes.map(code => bcrypt.hash(code, 10))
        );

        // Update backup codes
        await db.query(
            'UPDATE users SET backup_codes = $1 WHERE id = $2',
            [JSON.stringify(hashedBackupCodes), userId]
        );

        res.json({
            message: 'Backup codes regenerated',
            backupCodes
        });
    } catch (error) {
        console.error('Backup code regeneration error:', error);
        res.status(500).json({ error: 'Failed to regenerate backup codes' });
    }
};

/**
 * Get 2FA status for current user
 */
exports.get2FAStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            'SELECT two_factor_enabled FROM users WHERE id = $1',
            [userId]
        );

        res.json({
            enabled: result.rows[0]?.two_factor_enabled || false
        });
    } catch (error) {
        console.error('2FA status error:', error);
        res.status(500).json({ error: 'Failed to get 2FA status' });
    }
};
