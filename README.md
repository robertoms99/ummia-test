# UMMIA - Objetivos de Aprendizaje (Prueba Técnica)

Aplicación React + TypeScript para gestionar Objetivos de Aprendizaje (OA) en una plataforma educativa multi-tenant.

## 🚀 Tecnologías

- **React 18** con TypeScript
- **Vite** - Build tool y dev server
- **TailwindCSS** - Estilos utility-first
- **React Hook Form** + **Zod** - Manejo y validación de formularios
- **Mock Service Worker (MSW)** - Simulación de API GraphQL
- **GraphQL** - Queries y mutations

## 📦 Instalación Rápida

```bash
# 1. Instalar dependencias
pnpm install  # o npm install / yarn install

# 2. Inicializar MSW (importante!)
pnpm dlx msw@latest init public --save

# Si usas npm:
# npx msw@latest init public --save
```

## 🏃 Ejecución

```bash
# Modo desarrollo
pnpm dev

# Build para producción
pnpm build

# Preview del build
pnpm preview
```

La aplicación estará disponible en `http://localhost:5173`

## 🎯 Funcionalidades Implementadas 

### 1. Vista de Listado de OA

- ✅ Muestra solo la última versión ACTIVA por código
- ✅ Paginación con nextToken (botón "Cargar más")
- ✅ Filtros por asignatura y nivel
- ✅ Manejo de estados: loading, error, vacío
- ✅ Diseño responsive y accesible

### 2. Formulario de Creación

- ✅ Validaciones robustas con Zod:
  - Código: Formato XXX-#X-## (ej: MAT-1B-01)
  - Descripción: 10-500 caracteres
  - Nivel: Formato #B/#M/#T (ej: 1B, 2M)
  - Asignatura: Requerida, máx 50 caracteres
- ✅ Manejo de errores con mensajes claros
- ✅ Optimistic updates (el OA aparece inmediatamente)
- ✅ Estados ACTIVO/INACTIVO

### 3. Hook Personalizado `useOA(pais)`

- ✅ Estado interno con paginación acumulativa
- ✅ Minimiza re-renders (useCallback, useMemo, memo)
- ✅ Métodos: load, loadMore, refetch, reset, createOA
- ✅ Filtrado por última versión ACTIVA
- ✅ Filtros dinámicos por asignatura y nivel
- ✅ Manejo de optimistic updates


## 🧪 Casos Edge Cubiertos

- ✅ Múltiples versiones del mismo código (v1, v2, v3)
- ✅ Estados mezclados (ACTIVO/INACTIVO)
- ✅ Registro de distintos países (multi-tenant), por ahora tenemos Chile y Colombia
- ✅ Paginación en 2 páginas con nextToken
- ✅ Versión más alta INACTIVA (muestra última ACTIVA disponible)
- ✅ Filtros sin resultados

## 🎨 Decisiones de Diseño

### Arquitectura GraphQL con MSW

- **Contrato real**: Simula exactamente la respuesta de AppSync
- **Latencia artificial**: 350-450ms para simular red
- **Handlers tipados**: TypeScript end-to-end
- **Fácil migración**: Cambiar GRAPHQL_ENDPOINT cuando se conecte a AWS real

## 🔄 Migración a AWS Real

Para conectar con AppSync real, solo cambiar en `src/lib/graphql-client.ts`:

```typescript
// De:
import { GRAPHQL_ENDPOINT } from '@/mocks/handlers';

// A:
const GRAPHQL_ENDPOINT = process.env.VITE_APPSYNC_ENDPOINT;

// Y agregar headers de autenticación:
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
  'x-api-key': process.env.VITE_API_KEY,
}
```

### EJERCICIO 2 

1. Propuesta de Single Table Design para OA:
  Sin duda alguna usaria nuestros Tenants como clave conjunta seria lo mas eficiente, ya que es el primer filtro aplicable en nuestro sistema, nuestros objetivos de aprendizajes los creamos por paises inicialmente. Entonces podriamos crear algo como : TENANT#CL o TENANT#CO.
  Como clave secundaria usaria el codigo y la version de nuestro OA, esta es nuestra segunda condicion para mostrar listados, que nuestros OA sean activos y ordenados por version. Ej: OA#MAT-1B-01#1
  Para obtener nuestra ultima version activa, usaria una GSI que dependiera del codigo y version GSI1PK = PAIS#CODIGO , GSI1SK = VERSION
