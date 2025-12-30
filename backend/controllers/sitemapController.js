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
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

exports.generateSitemap = async (req, res) => {
    try {
        // Fetch dynamic content for sitemap
        // 1. Blog Posts
        const blogs = await db.query("SELECT slug, updated_at FROM blog_posts WHERE status = 'published'");
        
        // 2. Static Pages (could be fetched from a pages table if it exists, or hardcoded)
        const staticRoutes = [
            { url: '/', changefreq: 'daily', priority: 1.0 },
            { url: '/about', changefreq: 'monthly', priority: 0.7 },
            { url: '/contact', changefreq: 'monthly', priority: 0.7 },
            { url: '/blog', changefreq: 'daily', priority: 0.8 },
            // Add other static public routes here
        ];

        const links = staticRoutes.map(route => ({
            url: route.url,
            changefreq: route.changefreq,
            priority: route.priority
        }));

        // Add Blog Posts
        blogs.rows.forEach(post => {
            links.push({
                url: `/blog/${post.slug}`,
                changefreq: 'weekly',
                priority: 0.6,
                lastmod: post.updated_at
            });
        });

        // Create a stream to write to
        const stream = new SitemapStream({ hostname: process.env.SITE_URL || 'https://sippase.4bus.org' });

        const xml = await streamToPromise(Readable.from(links).pipe(stream)).then((data) =>
            data.toString()
        );

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error('Error generating sitemap:', err);
        res.status(500).end();
    }
};
