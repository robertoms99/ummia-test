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

## 1. Propuesta de Single Table Design para OA:

  Sin duda alguna usaria nuestros Tenants como clave primaria, seria lo mas eficiente, ya que es el primer filtro aplicable en nuestro sistema, y las consultas a nuestros objetivos de aprendizajes los creamos por paises inicialmente. Entonces podriamos crear algo como : TENANT#CL o TENANT#CO. Con esto ya evitariamos que se mezclen los OA entre paises.
  
  Como clave secundaria usaria el codigo y la version de nuestro OA, esta es nuestra segunda condicion para mostrar listados, que nuestros OA sean activos y ordenados por version. Entonces agrupar y cumplir la condicion del ultimo OA por codigo seria cumplido facilmente.Ej: OA#MAT-1B-01#1
  
  Para obtener nuestra ultima version por codigo, usaria una GSI que dependiera del codigo y version, algo asi como: GSI1PK = CL#MAT-1B-01 y GSI1SK = 2

## 2. Estrategia de versionamiento en DynamoDB:

  Estas vesiones las estamos manejando cuando se crea un nuevo registro por cada version de nuestros OA's. Entonces luego procederiamos a consultar la maxima version existente para ese codigo del tenant que necesitemos, incrementamos en nuestra logica la version y usamos esa version nueva con el mismo codigo, de esa manera tan sencilla. Podriamos entonces tener lo que llamariamos un historial de versiones para cada OA.

## 3. Cómo restringir acceso por país usando AppSync (@auth rules)

   En nuestros schemas de AppSync (Graphql) podriamos crear un @auth rules para hacer restriccinoes tanto por pais (que podriamos obtenerlos de nuestros claims de cognito), y que solo el owner sea el que tenga permitido estas operaciones, digamos que podriamos hacerlo tal como : 
```    
type OA
    @model
    @auth(rules: [
      {
        allow: owner,
        ownerField: "pais",
        identityClaim: "custom:pais"
      }
    ])```



## 4. Riesgos de controlar acceso solo en frontend

  Teniendo en cuenta el rule que definiriamos de @auth en nuestra api, estamos asegurando seguridad en nuestros accesos. Como sabemos, todo el frontend es publico, se puede hacer inyecciones, trazar requests, modificar queries y hacer intersecciones antes de mandar una petticion. Tambien se pueden llamar directamente a nuestro endpoint dado por appsync usando clientes http, esto es muy vulnerable a ataques por gente maliciosa que quiere obtener nuestros datos.
  Con nuestras reglas en AppSync, la validaciones extras, y nuestras claims en nuestro contexto de Cognito, estariamos restringiendo acceso a solo personas autorizadas.
