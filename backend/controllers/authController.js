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
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your_refresh_secret_key';

exports.login = async (req, res) => {
    let { username, password } = req.body;
    
    // Trim inputs to avoid whitespace issues
    if (username) username = username.trim();
    if (password) password = password.trim();

    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        console.log('✅ Password valid');
        
        let roles = [];
        let primaryRole = 'viewer';

        try {
            console.log('📋 Fetching user roles...');
            const rolesResult = await db.query(`
                SELECT r.name 
                FROM user_roles ur
                INNER JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = $1
            `, [user.id]);
            
            roles = rolesResult.rows.map(row => row.name);
            primaryRole = roles.length > 0 ? roles[0] : 'viewer';
        } catch (roleError) {
             console.error('⚠️ Error fetching roles:', roleError.message);
             // Fallback: checks if 'role' column exists in user object
             if (user.role) {
                 roles = [user.role];
                 primaryRole = user.role;
             }
        }
        
        // Use updated profile fields
        try {
            const accessToken = jwt.sign({ 
                id: user.id, 
                username: user.username, 
                roles: roles,
                role: primaryRole
            }, JWT_SECRET, { expiresIn: '15m' });
            
            const refreshToken = jwt.sign({ 
                id: user.id, 
                username: user.username, 
                roles: roles,
                role: primaryRole
            }, REFRESH_SECRET, { expiresIn: '7d' });

            console.log('✅ Login successful for user:', username);

            // Send response first for better UX, or just ensure update doesn't block
            // Update last login (non-blocking)
            try {
                await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
            } catch (updateError) {
                console.error('⚠️ Failed to update last_login:', updateError.message);
                // Do not fail the login request
            }

            res.json({ 
                accessToken, 
                refreshToken, 
                user: { 
                    id: user.id, 
                    username: user.username, 
                    email: user.email,
                    full_name: user.full_name,
                    avatar_url: user.avatar_url,
                    roles: roles,
                    role: primaryRole
                } 
            });
        } catch (tokenError) {
            console.error('❌ Token generation error:', tokenError);
            throw new Error('Token generation failed: ' + tokenError.message);
        }
    } catch (err) {
        console.error('❌ Login error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // From authMiddleware
        const { full_name, email, password, avatar_url } = req.body;
        
        let query = 'UPDATE users SET ';
        const params = [];
        let paramCount = 1;
        const updates = [];

        if (full_name !== undefined) {
            updates.push(`full_name = $${paramCount}`);
            params.push(full_name);
            paramCount++;
        }

        if (email !== undefined) {
             // Basic email validation could go here
            updates.push(`email = $${paramCount}`);
            params.push(email);
            paramCount++;
        }

        if (avatar_url !== undefined) {
            updates.push(`avatar_url = $${paramCount}`);
            params.push(avatar_url);
            paramCount++;
        }

        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            updates.push(`password_hash = $${paramCount}`);
            params.push(passwordHash);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.json({ message: 'No changes provided' });
        }

        query += updates.join(', ') + ` WHERE id = $${paramCount} RETURNING id, username, email, full_name, avatar_url`;
        params.push(userId);

        const result = await db.query(query, params);
        const updatedUser = result.rows[0];

        res.json({
            message: 'Profile updated',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Server error updating profile' });
    }
};

exports.refreshToken = (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const debugFile = path.join(__dirname, '../../debug_auth.txt');
    
    const { token } = req.body;
    // Enhanced debugging
    const logData = `
--- ${new Date().toISOString()} ---
Headers: ${JSON.stringify(req.headers)}
Body: ${JSON.stringify(req.body)}
Token Type: ${typeof token}
-----------------------------------
`;
    try {
        fs.appendFileSync(debugFile, logData);
        console.log('📝 Wrote debug info to debug_auth.txt');
    } catch (e) {
        console.error('❌ Failed to write debug file:', e);
    }
    
    console.log('🔄 Refresh Request Body:', req.body);
    console.log('🔄 Refresh Request Headers:', req.headers);
    console.log('🔄 Refresh Request Token Type:', typeof token);
    
    if (!token) {
        console.error('❌ Missing token in refresh body. Body keys:', Object.keys(req.body));
        // DEBUG: Return received body and headers to client for diagnosis
        return res.status(401).json({ 
            error: 'Refresh token required',
            debug: {
                receivedBody: req.body,
                contentType: req.headers['content-type'],
                headers: req.headers
            }
        });
    }

    jwt.verify(token, REFRESH_SECRET, (err, user) => {
        if (err) {
            console.error('❌ Refresh token verification failed:', err.message);
            // If the token is invalid/expired, it's a 403 Forbidden effectively for refresh purposes, 
            // but 401 is also acceptable. The client handles 401 by logging out usually.
            return res.sendStatus(403);
        }
        
        console.log('✅ Refresh token verified for user:', user.username);

        // Ensure we preserve the roles structure in the new access token
        const roles = user.roles || (user.role ? [user.role] : ['viewer']);
        const role = user.role || roles[0] || 'viewer';

        const accessToken = jwt.sign({ 
            id: user.id, 
            username: user.username, 
            roles: roles,
            role: role 
        }, JWT_SECRET, { expiresIn: '15m' });
        
        console.log('✅ New access token generated');
        
        res.json({ accessToken });
    });
};

exports.me = async (req, res) => {
    try {
        // Query user info (excluding potential triggers like 'role' if it doesn't exist)
        const userResult = await db.query(`
            SELECT id, username, email, full_name, avatar_url 
            FROM users 
            WHERE id = $1
        `, [req.user.id]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = userResult.rows[0];

        // Fetch user roles
        const rolesResult = await db.query(`
            SELECT r.name 
            FROM user_roles ur
            INNER JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = $1
        `, [user.id]);
        
        const roles = rolesResult.rows.map(row => row.name);
        const primaryRole = roles.length > 0 ? roles[0] : 'viewer';

        res.json({
            ...user,
            roles: roles,
            role: primaryRole
        });
    } catch (error) {
        console.error('Error fetching me:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
