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
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import { Notify } from 'quasar'
import router from '../router'

import { getBaseUrl } from '../utils/urlHelper'

const api = axios.create({
    baseURL: `${getBaseUrl()}/api`,
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore()
        if (authStore.token) {
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${authStore.token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const authStore = useAuthStore()
        const originalRequest = error.config

        // Handle network errors
        if (!error.response) {
            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                Notify.create({
                    type: 'negative',
                    message: 'La solicitud tardó demasiado. Por favor, intenta nuevamente.',
                    icon: 'timer_off',
                    position: 'top',
                    timeout: 4000
                })
            } else if (error.code === 'ERR_NETWORK') {
                Notify.create({
                    type: 'negative',
                    message: 'Error de conexión. Verifica tu conexión a internet.',
                    icon: 'wifi_off',
                    position: 'top',
                    timeout: 4000
                })
            } else {
                Notify.create({
                    type: 'negative',
                    message: 'No se pudo conectar con el servidor. Por favor, intenta más tarde.',
                    icon: 'cloud_off',
                    position: 'top',
                    timeout: 4000
                })
            }
            return Promise.reject(error)
        }

        const { status, data } = error.response

        // Handle specific HTTP status codes
        switch (status) {
            case 400:
                // Bad Request - Validation errors
                if (data.details && Array.isArray(data.details)) {
                    // Multiple validation errors
                    const messages = data.details.map(d => d.msg || d.message).join(', ')
                    Notify.create({
                        type: 'warning',
                        message: `Errores de validación: ${messages}`,
                        icon: 'warning',
                        position: 'top',
                        timeout: 5000,
                        html: true
                    })
                } else {
                    Notify.create({
                        type: 'warning',
                        message: data.message || 'Solicitud inválida',
                        icon: 'warning',
                        position: 'top',
                        timeout: 4000
                    })
                }
                break

            case 401:
                // Unauthorized - Token issues
                // Only attempt token refresh if user has a token (is authenticated)
                if (authStore.token && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
                    originalRequest._retry = true
                    try {
                        await authStore.refreshToken()
                        originalRequest.headers = originalRequest.headers || {}
                        originalRequest.headers.Authorization = `Bearer ${authStore.token}`
                        return api(originalRequest)
                    } catch (refreshError) {
                        // Refresh failed, logout user and redirect to login
                        authStore.logout()
                        Notify.create({
                            type: 'negative',
                            message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
                            icon: 'lock',
                            position: 'top',
                            timeout: 4000
                        })
                        router.push('/admin/login')
                        // Return a pending promise to halt the error chain while we redirect
                        return new Promise(() => {})
                    }
                }
                // For anonymous users, just show notification without redirect
                break

            case 403:
                // Forbidden - Insufficient permissions
                Notify.create({
                    type: 'negative',
                    message: data.message || 'No tienes permisos para realizar esta acción.',
                    icon: 'block',
                    position: 'top',
                    timeout: 4000
                })
                break

            case 404:
                // Not Found
                // Don't show notification for every 404, let components handle it
                // Only redirect if it's a critical API endpoint failure
                if (originalRequest.url?.includes('/api/') && !originalRequest.url?.includes('/pages/slug/')) {
                    console.warn('404 Not Found:', originalRequest.url)
                }
                break

            case 409:
                // Conflict - Duplicate entry
                Notify.create({
                    type: 'warning',
                    message: data.message || 'El recurso ya existe.',
                    icon: 'error',
                    position: 'top',
                    timeout: 4000
                })
                break

            case 422:
                // Unprocessable Entity
                Notify.create({
                    type: 'warning',
                    message: data.message || 'No se pudo procesar la solicitud.',
                    icon: 'warning',
                    position: 'top',
                    timeout: 4000
                })
                break

            case 429:
                // Too Many Requests
                Notify.create({
                    type: 'warning',
                    message: 'Demasiadas solicitudes. Por favor, espera un momento.',
                    icon: 'hourglass_empty',
                    position: 'top',
                    timeout: 5000
                })
                break

            case 500:
            case 502:
            case 503:
            case 504:
                // Server Errors
                Notify.create({
                    type: 'negative',
                    message: 'Error del servidor. Por favor, intenta más tarde.',
                    icon: 'error',
                    position: 'top',
                    timeout: 5000,
                    actions: [
                        {
                            label: 'Ver detalles',
                            color: 'white',
                            handler: () => {
                                router.push({
                                    path: '/error/500',
                                    query: import.meta.env.DEV ? { details: data.message } : {}
                                })
                            }
                        }
                    ]
                })
                break

            default:
                // Generic error
                Notify.create({
                    type: 'negative',
                    message: data.message || `Error desconocido (${status})`,
                    icon: 'error',
                    position: 'top',
                    timeout: 4000
                })
        }

        // For 401 errors without a token (anonymous users), just reject without redirecting
        return Promise.reject(error)
    }
)

export { api }
