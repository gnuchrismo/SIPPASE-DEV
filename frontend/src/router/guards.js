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
import { useAuthStore } from '../stores/authStore'

export function setupRouteGuards(router) {
    router.beforeEach((to, from, next) => {
        const authStore = useAuthStore()
        const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
        const isAdminRoute = to.path.startsWith('/admin') && to.path !== '/admin/login'

        // If route requires auth and user is not authenticated, redirect to login
        if (requiresAuth && !authStore.token) {
            next('/admin/login')
        } 
        // If user is authenticated and trying to access login page, redirect to dashboard
        else if (to.path === '/admin/login' && authStore.token) {
            next('/admin/dashboard')
        } 
        // Allow all other routes
        else {
            next()
        }
    })
}
