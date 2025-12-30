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
import { defineStore } from 'pinia'
import { api } from '../boot/axios'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
        user: JSON.parse(localStorage.getItem('user')) || null
    }),
    actions: {
        async login(username, password) {
            try {
                const response = await api.post('/auth/login', { username, password })
                this.token = response.data.accessToken
                this.refreshToken = response.data.refreshToken
                this.user = response.data.user

                localStorage.setItem('token', this.token)
                localStorage.setItem('refreshToken', this.refreshToken)
                localStorage.setItem('user', JSON.stringify(this.user))

                return true
            } catch (error) {
                console.error('Login failed', error)
                throw error
            }
        },
        async register(userData) {
            try {
                const response = await api.post('/auth/register', userData)
                // Auto login after register? Or just return success.
                // If backend returns tokens, we use them.
                if (response.data.accessToken) {
                    this.token = response.data.accessToken
                    this.refreshToken = response.data.refreshToken
                    this.user = response.data.user
                    localStorage.setItem('token', this.token)
                    localStorage.setItem('refreshToken', this.refreshToken)
                    localStorage.setItem('user', JSON.stringify(this.user))
                }
                return response.data
            } catch (error) {
                console.error('Registration failed', error)
                throw error
            }
        },
        async fetchProfile() {
            try {
                const response = await api.get('/auth/me');
                this.user = { ...this.user, ...response.data };
                localStorage.setItem('user', JSON.stringify(this.user));
                return this.user;
            } catch (error) {
                console.error('Fetch profile failed', error);
            }
        },
        async updateProfile(profileData) {
            try {
                const response = await api.put('/auth/me', profileData);
                // Update local state with returned user data
                this.user = { ...this.user, ...response.data.user };
                localStorage.setItem('user', JSON.stringify(this.user));
                return response.data;
            } catch (error) {
                 console.error('Update profile failed', error);
                 throw error;
            }
        },
        async refreshToken() {
            if (!this.refreshToken) {
                console.warn('No refresh token available');
                this.logout();
                return Promise.reject('No refresh token');
            }
            try {
                console.log('🔄 Attempting to refresh token. Current refresh token:', this.refreshToken ? 'Present' : 'Missing');
                const response = await api.post('/auth/refresh', { token: this.refreshToken })
                this.token = response.data.accessToken
                localStorage.setItem('token', this.token)
                console.log('✅ Token refreshed successfully');
                return this.token;
            } catch (error) {
                console.warn('Refresh token failed, logging out...');
                this.logout()
                throw error
            }
        },
        logout() {
            this.token = null
            this.refreshToken = null
            this.user = null
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
        }
    }
})
