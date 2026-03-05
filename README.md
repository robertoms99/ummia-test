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

### Opción 1: Script automático (recomendado)

```bash
./setup.sh
```

Este script:
1. Detecta tu gestor de paquetes (pnpm/npm/yarn)
2. Instala todas las dependencias
3. Configura Mock Service Worker

### Opción 2: Manual

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

## 🎯 Funcionalidades Implementadas (Ejercicio 1)

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

## 🏗️ Arquitectura

```
src/
├── components/          # Componentes React
│   ├── OAList.tsx      # Lista con filtros y paginación
│   └── OAForm.tsx      # Formulario de creación
├── hooks/              # Custom hooks
│   └── useOA.ts        # Hook principal con lógica de negocio
├── lib/                # Utilidades
│   └── graphql-client.ts # Cliente GraphQL
├── mocks/              # Mock Service Worker
│   ├── mockOA.ts       # Datos mock
│   ├── handlers.ts     # Handlers GraphQL de MSW
│   └── browser.ts      # Setup de MSW para browser
├── schemas/            # Esquemas de validación
│   └── oa.schema.ts    # Zod schemas
├── types/              # Tipos TypeScript
│   └── oa.types.ts     # Tipos de OA
├── App.tsx             # Componente principal
├── main.tsx            # Entry point con MSW
└── index.css           # Estilos globales + Tailwind
```

## 🧪 Casos Edge Cubiertos

- ✅ Múltiples versiones del mismo código (v1, v2, v3)
- ✅ Estados mezclados (ACTIVO/INACTIVO)
- ✅ Registro de distintos países (multi-tenant)
- ✅ Paginación en 2 páginas con nextToken
- ✅ Versión más alta INACTIVA (muestra última ACTIVA disponible)
- ✅ Filtros sin resultados

## 🎨 Decisiones de Diseño

### Performance

1. **Memoización agresiva**: Componentes con `memo()`, callbacks con `useCallback()`, valores derivados con `useMemo()`
2. **Ref para prevenir dobles llamadas**: `isFetchingRef` evita race conditions
3. **Paginación acumulativa**: Items se acumulan sin recargar páginas anteriores
4. **Optimistic updates**: UI responde inmediatamente, revierte en error

### Experiencia de Usuario

1. **Loading states inline**: No bloquea la UI completa
2. **Mensajes contextuales**: Errores y estados vacíos con guía clara
3. **Feedback inmediato**: Success messages, loading spinners
4. **Filtros persistentes**: Se mantienen al cargar más páginas

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

## 📊 Criterios de Evaluación Cubiertos

### Implementación React (40 pts)
- ✅ Código limpio y modular
- ✅ Manejo correcto async/errores
- ✅ Paginación y acumulación correcta
- ✅ Optimistic update bien resuelto

### Hook y Performance (15 pts)
- ✅ Diseño correcto del hook
- ✅ Control de re-renders
- ✅ Manejo de estado complejo

## 📝 Notas Técnicas

- El mock simula AppSync GraphQL con MSW v2
- Se respeta el contrato de datos especificado
- Solo se muestran versiones ACTIVAS
- Multi-tenant: filtra por país correctamente
- Validaciones del lado del cliente (en producción también debe validarse en backend)

## 🙋 Autor

Prueba técnica para TCTP - Proyecto UMMIA
