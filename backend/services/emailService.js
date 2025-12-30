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
const nodemailer = require('nodemailer');

// Email configuration - lazy initialization
let transporter = null;

function getTransporter() {
    if (!transporter) {
        try {
            const nodemailer = require('nodemailer');
            transporter = nodemailer.createTransporter({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        } catch (error) {
            console.warn('⚠️  Email service not configured:', error.message);
            throw new Error('Email service not available');
        }
    }
    return transporter;
}

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (email, username, resetToken, resetUrl) => {
    const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@sippase.gob.bo',
       to: email,
        subject: 'Recuperación de Contraseña - SIPPASE Portal',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; }
                    .button { display: inline-block; background: #1976d2; color: white; padding: 12px 30px; 
                             text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>SIPPASE Portal</h1>
                    </div>
                    <div class="content">
                        <h2>Recuperación de Contraseña</h2>
                        <p>Hola <strong>${username}</strong>,</p>
                        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                        <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                        <p style="text-align: center;">
                            <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
                        </p>
                        <p>O copia y pega este enlace en tu navegador:</p>
                        <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
                        <div class="warning">
                            <strong>⚠️ Importante:</strong>
                            <ul>
                                <li>Este enlace expirará en <strong>1 hora</strong></li>
                                <li>Si no solicitaste este cambio, ignora este correo</li>
                                <li>Nunca compartas este enlace con nadie</li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Este es un correo automático, por favor no respondas.</p>
                        <p>&copy; ${new Date().getFullYear()} SIPPASE - Sistema Plurinacional de Prevención, Atención, Sanción y Erradicación de Violencia</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const transporter = getTransporter();
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

/**
 * Send password changed confirmation email
 */
exports.sendPasswordChangedEmail = async (email, username) => {
    const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@sippase.gob.bo',
        to: email,
        subject: 'Contraseña Actualizada - SIPPASE Portal',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; }
                    .success { background: #d4edda; border-left: 4px solid #28a745; padding: 12px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>SIPPASE Portal</h1>
                    </div>
                    <div class="content">
                        <h2>Contraseña Actualizada</h2>
                        <p>Hola <strong>${username}</strong>,</p>
                        <div class="success">
                            <strong>✓ Confirmación:</strong> Tu contraseña ha sido actualizada exitosamente.
                        </div>
                        <p>Si no realizaste este cambio, contacta inmediatamente con el administrador del sistema.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} SIPPASE</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

/**
 * Verify email configuration
 */
exports.verifyEmailConfig = async () => {
    try {
        const transporter = getTransporter();
        await transporter.verify();
        console.log('✅ Email service is configured correctly');
        return true;
    } catch (error) {
        console.error('❌ Email service configuration error:', error.message);
        return false;
    }
};
