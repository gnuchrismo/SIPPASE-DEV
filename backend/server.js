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
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

require('dotenv').config();


const logger = require('./utils/logger');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "frame-ancestors": [
                "'self'", 
                "http://localhost:5173", 
                "http://localhost:9000", 
                "https://localhost:5173", 
                "https://localhost:9000",
                "https://sippase.4bus.org",
                "https://portal.sippase.justicia.gob.bo",
                "http://portal.sippase.justicia.gob.bo"
            ]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth/login', limiter);

// Request logging middleware
app.use(errorMiddleware.requestLogger);

// Body parsing middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:9000',
            'https://localhost:5173',
            'https://localhost:9000',
            'https://portal.sippase.justicia.gob.bo',
            process.env.CLIENT_URL
        ].filter(Boolean);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const routes = require('./routes');

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'SIPPASE API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Public routes
app.get('/sitemap.xml', require('./controllers/sitemapController').generateSitemap);
app.get('/robots.txt', require('./controllers/seoController').getRobotsTxt);

// API routes
app.use('/api', routes);

// 404 Handler - Must be after all routes
app.use(errorMiddleware.notFoundHandler);

// Error handling middleware - Must be last
app.use(errorMiddleware.errorLogger);
app.use(errorMiddleware.errorHandler);

// Graceful shutdown handler
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', { promise, reason });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Start Server
const server = app.listen(PORT, () => {
    logger.success(`Server is running on http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Database: PostgreSQL`);
});



module.exports = app;

