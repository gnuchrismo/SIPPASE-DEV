# Verificación de Base de Datos - SIPPASE Security Features

## Estado de la Implementación

### ✅ Schema Aplicado Correctamente

El schema `schema_security.sql` fue aplicado exitosamente con las siguientes acciones:

**Tablas Creadas/Verificadas:**
- ✅ `roles` - Definición de roles del sistema
- ✅ `permissions` - Permisos granulares
- ✅ `role_permissions` - Relación roles-permisos
- ✅ `user_roles` - Asignación de roles a usuarios
- ✅ `audit_logs` - Registro de auditoría (recreada)
- ✅ `password_reset_tokens` - Tokens para reset de contraseña
- ✅ `audit_log_retention` - Política de retención

**Columnas Agregadas a `users`:**
- ✅ `two_factor_secret` - Secret para 2FA
- ✅ `two_factor_enabled` - Flag de 2FA activo
- ✅ `backup_codes` - Códigos de respaldo

**Índices Creados:**
- ✅ Índices en `role_permissions` (role_id, permission_id)
- ✅ Índices en `user_roles` (user_id, role_id)
- ✅ Índices en `audit_logs` (user_id, action, entity, created_at, details GIN)
- ✅ Índices en `password_reset_tokens` (token, user_id, expires_at)

### ⚠️ Advertencia Detectada

```
ERROR:  no existe la columna u.is_active
```

Este error apareció al crear la vista `user_roles_view`. Esto significa que la tabla `users` no tiene la columna `is_active`. Necesitamos verificar y posiblemente agregar esta columna.

---

## Comandos Manual de Verificación

Ya que `psql` requiere contraseña interactiva, puedes ejecutar estos comandos manualmente.

### 1. Verificar Estructura de Tabla Users

```bash
psql -U postgres -d sippase_db
```

Luego en el prompt de psql:

```sql
\d users
```

### 2. Ejecutar Script de Verificación Completo

```bash
psql -U postgres -d sippase_db -f db/verify_security.sql
```

Este script mostrará:
- ✅ Todas las tablas y su estado
- ✅ Estructura completa de `users`
- ✅ Conteo de registros en cada tabla
- ✅ Roles creados con cantidad de usuarios y permisos
- ✅ Permisos agrupados por módulo
- ✅ Usuarios y sus roles asignados
- ✅ Detalles de permisos por rol

### 3. Poblar Roles y Permisos

```bash
node db/seed_security.js
```

Este script creará:
- 3 roles (admin, editor, viewer)
- 32 permisos (8 módulos × 4 acciones)
- Asignaciones de permisos a roles
- Asignación del rol admin al usuario admin

---

## Verificaciones Rápidas (SQL Directo)

### Ver todas las tablas

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Verificar si hay roles

```sql
SELECT * FROM roles;
```

Si retorna vacío, ejecutar el seed.

### Verificar si hay permisos

```sql
SELECT module, COUNT(*) 
FROM permissions 
GROUP BY module;
```

Debería mostrar 8 módulos con 4 permisos cada uno.

### Ver usuarios y sus roles

```sql
SELECT 
    u.username,
    string_agg(r.name, ', ') as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.username;
```

---

## Posible Fix para is_active

Si la tabla `users` no tiene la columna `is_active`, agrégala con:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
```

Luego recrea la vista:

```sql
DROP VIEW IF EXISTS user_roles_view;

CREATE VIEW user_roles_view AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    u.is_active,
    r.id as role_id,
    r.name as role_name,
    r.description as role_description
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id;
```

---

## Checklist de Verificación

Marca cada item después de verificar:

### Database Schema
- [ ] Tabla `roles` existe con 3 registros (admin, editor, viewer)
- [ ] Tabla `permissions` existe con 32 registros
- [ ] Tabla `role_permissions` tiene asignaciones  
- [ ] Tabla `user_roles` tiene al menos el admin asignado
- [ ] Tabla `audit_logs` existe y está vacía inicialmente
- [ ] Tabla `password_reset_tokens` existe
- [ ] Columna `users.is_active` existe
- [ ] Columna `users.two_factor_secret` existe
- [ ] Columna `users.two_factor_enabled` existe
- [ ] Columna `users.backup_codes` existe

### Seed Data
- [ ] Ejecutado `node db/seed_security.js` sin errores
- [ ] Usuario `admin` tiene rol `admin` asignado
- [ ] Rol `admin` tiene todos los permisos (32)
- [ ] Rol `editor` tiene permisos limitados (~20)
- [ ] Rol `viewer` tiene solo permisos de lectura (8)

### Backend
- [ ] Servidor inicia sin errores: `npm run dev`
- [ ] No hay errores de conexión a DB
- [ ] Endpoints `/api/roles` responden
- [ ] Endpoints `/api/permissions` responden
- [ ] Endpoints `/api/audit-logs` responden

### Frontend
- [ ] Cliente inicia sin errores: `npm run dev`
- [ ] Ruta `/admin/audit-logs` carga
- [ ] Ruta `/admin/roles` carga
- [ ] Ruta `/forgot-password` carga
- [ ] Ruta `/reset-password/:token` carga

---

## Próximos Pasos

1. **Verificar `users.is_active`**: Ejecuta `\d users` y verifica si existe
2. **Ejecutar seed**: `node db/seed_security.js`
3. **Verificar datos**: Ejecuta el script `verify_security.sql`
4. **Configurar SMTP**: Agrega credenciales en `.env` para password recovery
5. **Iniciar servidores**: Backend y frontend para testing
6. **Test manual**: Seguir la sección "Testing Guidelines" del walkthrough

---

## Soporte

Si encuentras errores:

1. Verifica conexión a PostgreSQL
2. Verifica que el usuario `postgres` tenga permisos
3. Revisa logs del servidor backend
4. Consulta el [walkthrough.md](file:///C:/Users/Christian%20Mollo-UNW/.gemini/antigravity/brain/1852304e-7aa2-41ad-8612-3a4f32a476e5/walkthrough.md) para guías de testing

---

## Archivos de Referencia

- **Verification Script**: [verify_security.sql](file:///c:/sic4bus/sippase-portal/server/db/verify_security.sql)
- **Security Schema**: [schema_security.sql](file:///c:/sic4bus/sippase-portal/server/db/schema_security.sql)
- **Seed Script**: [seed_security.js](file:///c:/sic4bus/sippase-portal/server/db/seed_security.js)
- **Init Manual**: [init_security.sql](file:///c:/sic4bus/sippase-portal/server/db/init_security.sql)
