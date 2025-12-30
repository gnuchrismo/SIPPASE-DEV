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
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/published', blogController.getPublishedPosts);
router.get('/post/:slug', blogController.getPostBySlug);
router.get('/categories', blogController.getCategories);

// Admin routes (require authentication)
router.get('/posts', authenticateToken, blogController.getAllPosts);
router.get('/posts/:id', authenticateToken, blogController.getPostById);
router.post('/posts', authenticateToken, blogController.upload.single('featured_image'), blogController.createPost);
router.put('/posts/:id', authenticateToken, blogController.upload.single('featured_image'), blogController.updatePost);
router.delete('/posts/:id', authenticateToken, blogController.deletePost);

// Media management routes
router.get('/posts/:id/media', authenticateToken, blogController.getPostMedia);
router.post('/posts/:id/media', authenticateToken, blogController.addMedia);
router.delete('/posts/:id/media/:mediaId', authenticateToken, blogController.removeMedia);

module.exports = router;
