# PORTAL WEB SIPPASE - Gestor de Contenidos basado en ROBITCMS

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%3E%3D12.0-blue.svg)](https://www.postgresql.org/)

## 📋 Descripción

Portal WEB SIPPASE es un sistema integral de contenidos como componente del SIPPASE.
Como componente del SIPPASE se ha desarrollado e implementado el portal web con información relacionada al estado de situación de violencia contra la mujer como son: 
- Servicios de ayuda,
- Gestor de conocimientos,
- Estadística Oficial,
- Formación,
- Promotoras y
- Seguimiento a denuncia de violencia.

El en su versión en producción esta publicado bajo la siguiente URL: https://portal.sippase.justicia.gob.bo/

El portal web es administrado por personal técnico de la **DIRECCIÓN GENERAL DE PREVENCIÓN Y ELIMINACIÓN DE TODA FORMA DE VIOLENCIA EN RAZÓN DE GENERO Y GENERACIONAL
VICEMINISTERIO DE IGUALDAD DE OPORTUNIDADES (VIO) DEL MINISTERIOS DE JUSTICIA Y TRANSPARENCIA INSTITUCIONAL**.

### Características Principales

- 📊 **Gestión de Blog/noticias**: Control completo del ciclo blog y noticias
- 💰 **Cursos y Tutoriales**: Gestión de Cursos y Tutoriales
- 📈 **Reportes y Estadísticas**: Dashboards interactivos y reportes personalizables
- 👥 **Gestión de Usuarios**: Sistema de roles y permisos granulares
- 📱 **Responsive**: Interfaz adaptable a dispositivos móviles y tablets
- 🔒 **Seguridad**: Autenticación JWT y control de acceso basado en roles

## 🏗️ Arquitectura

### Backend
- **Framework**: Node.js + Express
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (JSON Web Tokens)
- **ORM**: Sequelize / pg (PostgreSQL client)

### Frontend
- **Framework**: Vue.js 3
- **UI Framework**: Quasar Framework
- **Build Tool**: Vite
- **State Management**: Pinia
- **HTTP Client**: Axios

## 🚀 Instalación

### Requisitos Previos

- Node.js >= 16.0.0
- PostgreSQL >= 12.0
- npm o yarn

### 1. Clonar el Repositorio

```bash
git clone https://github.com/gnuchrismo/SIPPASE-DEV.git
cd SIPPASE-DEV
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Copiar archivo de configuración de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de base de datos
nano .env
```

**Configuración de .env:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sippase_db
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
JWT_SECRET=tu_secreto_jwt_aqui
PORT=8001
```

### 3. Configurar Base de Datos

```bash
# Crear base de datos
createdb sippase_db

# Ejecutar migraciones (si existen)
npm run migrate

# Ejecutar seeders (datos iniciales)
npm run seed
```

### 4. Iniciar Backend

```bash
npm run dev
```

El backend estará disponible en `http://localhost:8001`

### 5. Configurar Frontend

```bash
cd ../frontend
npm install

# Copiar archivo de configuración de ejemplo
cp .env.example .env

# Editar .env con la URL del backend
nano .env
```

**Configuración de .env:**
```env
VITE_API_URL=http://localhost:8001/api
VITE_AUTH_URL=http://localhost:8001/auth
VITE_BACKEND_URL=http://localhost:8001
```

### 6. Iniciar Frontend

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 📖 Documentación

### Estructura del Proyecto

```
SIPPASE-DEV/
├── backend/
│   ├── controllers/      # Controladores de la API
│   ├── routes/           # Definición de rutas
│   ├── middleware/       # Middlewares (auth, validation, etc.)
│   ├── services/         # Lógica de negocio
│   ├── utils/            # Utilidades y helpers
│   ├── db/               # Configuración de base de datos
│   ├── server.js         # Punto de entrada del servidor
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Componentes Vue reutilizables
│   │   ├── views/        # Vistas/Páginas
│   │   ├── router/       # Configuración de rutas
│   │   ├── stores/       # Stores de Pinia
│   │   ├── services/     # Servicios API
│   │   └── assets/       # Recursos estáticos
│   ├── public/           # Archivos públicos
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

### API Endpoints

#### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/refresh` - Refrescar token

#### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

#### Presupuestos
- `GET /api/budgets` - Listar presupuestos
- `POST /api/budgets` - Crear presupuesto
- `PUT /api/budgets/:id` - Actualizar presupuesto
- `DELETE /api/budgets/:id` - Eliminar presupuesto

*(Ver documentación completa de API en `/docs/API.md`)*

## 🧪 Testing

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

## 🚢 Despliegue

### Producción

#### Backend

```bash
cd backend
npm run build
npm start
```

#### Frontend

```bash
cd frontend
npm run build
```

Los archivos compilados estarán en `frontend/dist/`

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) para conocer el proceso de contribución.

### Proceso Rápido

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Convenciones de Código

- **JavaScript**: ESLint + Prettier
- **Commits**: Conventional Commits
- **Branches**: `feature/`, `fix/`, `docs/`, `refactor/`

## 🐛 Reportar Bugs

Si encuentras un bug, por favor abre un [Issue](https://github.com/gnuchrismo/SIPPASE-DEV/issues) con:
- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado vs. actual
- Screenshots (si aplica)
- Versión del navegador/Node.js

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Christian Mollo** - [@gnuchrismo](https://github.com/gnuchrismo)

## 🙏 Agradecimientos

- Equipo de desarrollo SIPPASE
- Comunidad de Vue.js y Quasar
- Todos los contribuidores

## 📞 Contacto

Para preguntas o soporte:
- Email: gnuchrismo@gmail.com
- GitHub Issues: [SIPPASE-DEV Issues](https://github.com/gnuchrismo/SIPPASE-DEV/issues)

---

**Nota**: Este es un repositorio público para desarrollo y colaboración. No incluye datos sensibles ni configuraciones de producción.
