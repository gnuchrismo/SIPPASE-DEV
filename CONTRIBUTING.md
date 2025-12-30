# Guía de Contribución

¡Gracias por tu interés en contribuir a SIPPASE! Este documento proporciona pautas para contribuir al proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Estándares de Código](#estándares-de-código)
- [Convenciones de Commits](#convenciones-de-commits)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)

## 🤝 Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código. Por favor reporta comportamientos inaceptables.

## 🚀 Cómo Contribuir

### 1. Fork del Repositorio

```bash
# Fork en GitHub, luego clona tu fork
git clone https://github.com/TU-USUARIO/SIPPASE-DEV.git
cd SIPPASE-DEV
```

### 2. Configurar el Repositorio Upstream

```bash
git remote add upstream https://github.com/gnuchrismo/SIPPASE-DEV.git
git fetch upstream
```

### 3. Crear una Rama

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear rama para tu feature/fix
git checkout -b feature/nombre-descriptivo
```

**Convenciones de nombres de ramas:**
- `feature/` - Nuevas funcionalidades
- `fix/` - Corrección de bugs
- `docs/` - Cambios en documentación
- `refactor/` - Refactorización de código
- `test/` - Agregar o modificar tests
- `chore/` - Tareas de mantenimiento

### 4. Hacer Cambios

- Escribe código limpio y bien documentado
- Sigue los estándares de código del proyecto
- Agrega tests para nuevas funcionalidades
- Actualiza la documentación si es necesario

### 5. Commit de Cambios

```bash
git add .
git commit -m "feat: descripción breve del cambio"
```

Ver [Convenciones de Commits](#convenciones-de-commits) para más detalles.

### 6. Push a tu Fork

```bash
git push origin feature/nombre-descriptivo
```

### 7. Abrir Pull Request

- Ve a tu fork en GitHub
- Haz clic en "New Pull Request"
- Selecciona tu rama
- Completa la plantilla de PR
- Espera revisión

## 🔄 Proceso de Pull Request

### Antes de Enviar

- [ ] El código compila sin errores
- [ ] Todos los tests pasan
- [ ] El código sigue los estándares del proyecto
- [ ] La documentación está actualizada
- [ ] Los commits siguen las convenciones
- [ ] No hay conflictos con la rama main

### Plantilla de PR

```markdown
## Descripción
[Descripción clara de los cambios]

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## ¿Cómo se ha probado?
[Describe las pruebas realizadas]

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado mi código en áreas difíciles de entender
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He agregado tests que prueban mi fix/feature
- [ ] Todos los tests pasan localmente
```

### Proceso de Revisión

1. **Revisión Automática**: GitHub Actions ejecutará tests y linters
2. **Revisión de Código**: Un maintainer revisará tu código
3. **Cambios Solicitados**: Si se solicitan cambios, actualiza tu PR
4. **Aprobación**: Una vez aprobado, tu PR será mergeado

## 📝 Estándares de Código

### JavaScript/Node.js

- **Estilo**: ESLint + Prettier
- **Indentación**: 2 espacios
- **Comillas**: Simples (`'`)
- **Punto y coma**: Requerido

```javascript
// ✅ Bueno
const getUserById = async (id) => {
  try {
    const user = await User.findByPk(id);
    return user;
  } catch (error) {
    throw new Error(`User not found: ${error.message}`);
  }
};

// ❌ Malo
const getUserById=async(id)=>{
try{
const user=await User.findByPk(id)
return user
}catch(error){
throw new Error("User not found: "+error.message)
}
}
```

### Vue.js

- **Componentes**: PascalCase
- **Props**: camelCase
- **Events**: kebab-case
- **Composition API**: Preferido sobre Options API

```vue
<!-- ✅ Bueno -->
<template>
  <div class="user-card">
    <h3>{{ userName }}</h3>
    <button @click="handleClick">Click</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const userName = ref('');

const handleClick = () => {
  // ...
};
</script>
```

### SQL

- **Nombres de tablas**: snake_case, plural
- **Nombres de columnas**: snake_case
- **Claves primarias**: `id`
- **Claves foráneas**: `tabla_id`

## 💬 Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para mensajes de commit claros y consistentes.

### Formato

```
<tipo>[alcance opcional]: <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan el código)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento
- `perf`: Mejoras de rendimiento

### Ejemplos

```bash
# Nueva funcionalidad
git commit -m "feat(auth): add password reset functionality"

# Corrección de bug
git commit -m "fix(api): resolve null pointer in user controller"

# Documentación
git commit -m "docs(readme): update installation instructions"

# Refactorización
git commit -m "refactor(budget): simplify calculation logic"

# Breaking change
git commit -m "feat(api)!: change response format

BREAKING CHANGE: API responses now use camelCase instead of snake_case"
```

## 🐛 Reportar Bugs

### Antes de Reportar

- Verifica que el bug no haya sido reportado antes
- Asegúrate de estar usando la última versión
- Intenta reproducir el bug en un entorno limpio

### Plantilla de Bug Report

```markdown
**Descripción del Bug**
[Descripción clara y concisa del bug]

**Pasos para Reproducir**
1. Ir a '...'
2. Hacer clic en '...'
3. Scroll hasta '...'
4. Ver error

**Comportamiento Esperado**
[Lo que esperabas que sucediera]

**Comportamiento Actual**
[Lo que realmente sucedió]

**Screenshots**
[Si aplica, agrega screenshots]

**Entorno**
- OS: [e.g. Windows 11, Ubuntu 22.04]
- Navegador: [e.g. Chrome 120, Firefox 121]
- Node.js: [e.g. 18.17.0]
- Versión: [e.g. 1.0.0]

**Información Adicional**
[Cualquier otra información relevante]
```

## 💡 Sugerir Mejoras

### Plantilla de Feature Request

```markdown
**¿Tu solicitud está relacionada con un problema?**
[Descripción clara del problema]

**Describe la solución que te gustaría**
[Descripción clara de lo que quieres que suceda]

**Describe alternativas que hayas considerado**
[Otras soluciones o features que hayas considerado]

**Contexto Adicional**
[Cualquier otro contexto o screenshots]
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Escribir Tests

- Escribe tests para toda nueva funcionalidad
- Mantén los tests simples y enfocados
- Usa nombres descriptivos para los tests

```javascript
// ✅ Bueno
describe('UserController', () => {
  describe('getUserById', () => {
    it('should return user when valid id is provided', async () => {
      // ...
    });

    it('should throw error when user not found', async () => {
      // ...
    });
  });
});
```

## 📚 Recursos

- [Documentación de Vue.js](https://vuejs.org/)
- [Documentación de Quasar](https://quasar.dev/)
- [Documentación de Express](https://expressjs.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## ❓ Preguntas

Si tienes preguntas, puedes:
- Abrir un [Discussion](https://github.com/gnuchrismo/SIPPASE-DEV/discussions)
- Contactar a los maintainers
- Revisar la documentación existente

## 🙏 Agradecimientos

¡Gracias por contribuir a SIPPASE! Tu ayuda hace que este proyecto sea mejor para todos.

---

**Nota**: Esta guía está en constante evolución. Si tienes sugerencias para mejorarla, ¡no dudes en contribuir!
