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
import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import IndexPage from '../pages/IndexPage.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import Dashboard from '../pages/admin/Dashboard.vue'
import Users from '../pages/admin/Users.vue'
import Sliders from '../pages/admin/Sliders.vue'
import Documents from '../pages/admin/Documents.vue'
import Systems from '../pages/admin/Systems.vue'
import Statistics from '../pages/admin/Statistics.vue'
import Login from '../pages/admin/Login.vue'
import { setupRouteGuards } from './guards'

const routes = [
    {
        path: '/',
        component: MainLayout,
        children: [
            { path: '', component: IndexPage },
            { path: 'estadisticas', component: () => import('../pages/StatisticsPage.vue') },
            { path: 'noticias/:slug', component: () => import('../pages/BlogPost.vue') },
            { path: 'page/:slug', component: () => import('../pages/PageView.vue') },
            { path: 'tutorials', component: () => import('../pages/tutorials/TutorialCatalog.vue') },
            { path: 'tutorials/:slug', component: () => import('../pages/tutorials/TutorialViewer.vue') }
        ]
    },
    {
        path: '/admin/login',
        component: Login
    },
    {
        path: '/forgot-password',
        component: () => import('../pages/ForgotPassword.vue')
    },
    {
        path: '/reset-password/:token',
        component: () => import('../pages/ResetPassword.vue')
    },
    {
        path: '/admin',
        component: AdminLayout,
        meta: { requiresAuth: true },
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'menu-manager', component: () => import('../pages/admin/MenuManager.vue'), meta: { requiresAdmin: true } },
            { path: 'users', component: Users },
            { path: 'sliders', component: Sliders },
            { path: 'documents', component: Documents },
            { path: 'document-categories', component: () => import('../pages/admin/DocumentCategories.vue') },
            { path: 'systems', component: Systems },
            { path: 'statistics', component: Statistics },
            { path: 'messages', component: () => import('../pages/admin/ContactMessages.vue') },
            { path: 'media', component: () => import('../pages/admin/MediaLibrary.vue') },
            { path: 'audit-logs', component: () => import('../pages/admin/AuditLogs.vue'), meta: { requiresAdmin: true } },
            { path: 'roles', component: () => import('../pages/admin/Roles.vue'), meta: { requiresAdmin: true } },
            { path: 'settings', component: () => import('../pages/admin/Settings.vue') },
            { path: 'alerts', component: () => import('../pages/admin/AlertsPage.vue') },
            { path: 'blog', component: () => import('../pages/admin/Blog.vue') },
            { path: 'seo', component: () => import('../pages/admin/SeoSettings.vue'), meta: { requiresAdmin: true } },
            { path: 'pages', component: () => import('../pages/admin/Pages.vue') },
            // Tutorials Module
            { path: 'tutorials', component: () => import('../pages/admin/tutorials/TutorialList.vue') },
            { path: 'tutorials/create', component: () => import('../pages/admin/tutorials/TutorialBuilder.vue') },
            { path: 'tutorials/:id/edit', component: () => import('../pages/admin/tutorials/TutorialBuilder.vue') },
            { path: 'profile', component: () => import('../pages/admin/Profile.vue') }
        ]
    },
    // Error Routes
    {
        path: '/error/404',
        name: 'NotFound',
        component: () => import('../pages/NotFound.vue')
    },
    {
        path: '/error/500',
        name: 'ServerError',
        component: () => import('../pages/ServerError.vue')
    },
    {
        path: '/error/:code?',
        name: 'Error',
        component: () => import('../pages/ErrorPage.vue'),
        props: route => ({
            errorCode: route.params.code || '500',
            errorMessage: route.query.message,
            errorDescription: route.query.description
        })
    },
    // 404 Catch-all Route - Must be last
    {
        path: '/:pathMatch(.*)*',
        component: () => import('../pages/NotFound.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

setupRouteGuards(router)

// Integración de Analytics - Rastrear page views automáticamente
import { useAnalytics } from '../composables/useAnalytics'

router.afterEach((to) => {
  // Solo rastrear páginas públicas (no admin)
  if (!to.path.startsWith('/admin') && !to.path.startsWith('/error')) {
    const { trackPageView } = useAnalytics()
    // Usar nextTick para asegurar que el título de la página esté actualizado
    setTimeout(() => {
      trackPageView(to)
    }, 100)
  }
})

export default router
