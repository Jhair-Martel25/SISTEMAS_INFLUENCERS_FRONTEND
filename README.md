# Sistema Influencers — Frontend

Plataforma interna de **Sembrando Perú** para automatizar validaciones, campañas, agendas y seguimiento de influencers con impacto social.

Frontend construido con **Next.js (App Router)** + **TypeScript** + **Tailwind CSS v4**.

## Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.x | Framework (App Router, `proxy.ts` para protección de rutas) |
| React | 19.x | UI |
| TypeScript | 5.x | Tipado estricto (`strict: true`) |
| Tailwind CSS | 4.x | Estilos (solo Tailwind; tokens en `@theme`) |
| TanStack Query | 5.x | Caché y estado de datos del servidor |
| Zustand | 5.x | Estado global (sesión/autenticación) |
| Zod | 4.x | Validación de formularios y contratos de API |
| openapi-typescript | 7.x | Tipos generados desde el Swagger del backend |
| lucide-react | 1.x | Iconos |

## Requisitos

- Node.js 20+ (gestor de paquetes: **pnpm**)
- Backend NestJS corriendo localmente (ver `CONTEXTO_FRONTEND.md`)

## Puesta en marcha

```bash
# 1. Instalar dependencias
pnpm install

# 2. Crear variables de entorno (copiar la plantilla)
cp .env.example .env

# 3. Levantar el servidor de desarrollo
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base de la API (NestJS), sin barra final | `http://localhost:3000` |

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Sirve el build de producción |
| `pnpm lint` | ESLint (flat config) |
| `pnpm typecheck` | Chequeo de tipos (tsc, sin emitir) |
| `pnpm generate:types` | Regenera `src/types/generated/dto.ts` desde `openapi.json` |

> Ejecutar `pnpm typecheck` y `pnpm lint` antes de cada commit/PR.

## Estructura del proyecto

```
src/
├── app/                    # Rutas (App Router) y layouts
│   ├── (protected)/        # Layout con guard por rol (Sidebar/Header/Footer)
│   ├── login/              # Página de login
│   └── ...
├── components/
│   ├── layout/             # Shell de la app (Header, Sidebar, Footer)
│   └── ui/                 # Primitivos reutilizables (Button, InputField)
├── config/
│   ├── navigation.ts       # Navegación (única fuente de verdad)
│   └── roles.ts            # Permisos por rol + ruta inicial por rol
├── features/               # Lógica de dominio por módulo
│   └── <feature>/
│       ├── services/       # Clientes de API (TanStack Query / apiClient)
│       ├── hooks/          # Hooks con lógica React (datos, formularios)
│       ├── schemas/        # Schemas Zod (formularios / contratos)
│       └── components/     # UI específica de la feature
├── hooks/                  # Hooks globales (useAuth, usePermission)
├── lib/
│   ├── auth-storage.ts     # Persistencia de sesión (localStorage + cookie espejo)
│   ├── http/               # Cliente HTTP con auto-refresh (401) y ApiError
│   └── utils/              # Utilidades (fechas, formatos)
├── proxy.ts                # Protección de rutas en servidor (Next 16)
├── store/                  # Stores Zustand
└── types/
    ├── api.ts              # Cánon de estados y envoltorios de respuesta
    ├── auth.ts             # Tipos de autenticación
    └── generated/          # Tipos generados (openapi-typescript)
```

### Convenciones

- **UI específica de un módulo** → `features/<feature>/components/`. **No** en `components/<feature>`.
- **Primitivos reutilizables** → `components/ui/`.
- **Lógica de dominio** (servicios, hooks, schemas) → dentro de `features/<feature>/`.
- **Una sola fuente de verdad**: estados en `types/api.ts`, navegación en `config/navigation.ts`, permisos en `config/roles.ts`.
- **Estilos**: solo Tailwind. Los tokens de diseño viven en el bloque `@theme` de `src/app/globals.css`.
- Cuando el backend cambie su contrato, regenerar los tipos con `pnpm generate:types`.

## Autenticación

- **Login:** `POST /auth/login` → devuelve `usuario`, `backendToken`, `refreshToken`.
- **Refresh:** el cliente HTTP renueva automáticamente el token ante un `401` (con rotación de refresh token, una sola petición simultánea).
- **Sesión:** los tokens se guardan en `localStorage` y una cookie espejo `sp_token` que lee `src/proxy.ts` para proteger las rutas en servidor.
- **Rutas protegidas:** el `proxy` redirige a `/login?redirect=<ruta>`; tras el login se vuelve a esa ruta (o al home según rol).

## Contrato con el backend

El detalle del contrato (estados, formatos de respuesta, timezone, endpoints) está documentado en [`CONTEXTO_FRONTEND.md`](./CONTEXTO_FRONTEND.md). Mantenerlo actualizado cuando cambie la API.

## Deuda técnica conocida

- **Tokens en `localStorage` + cookie no `httpOnly`**: el JWT vive en `localStorage` (accesible por JS → susceptible a XSS) y la cookie espejo `sp_token` no es `httpOnly` ni `secure` (la setea el cliente). Pendiente: migrar a cookies `httpOnly` con un flujo de refresh seguro. Impacto actual aceptado en esta etapa.
- **`proxy.ts`**: al no tener el rol en la cookie, un usuario ya logueado que visita `/login` es redirigido a `/dashboard`; el guard por rol de `(protected)/layout` lo reencamina a su home si no tiene permiso.
