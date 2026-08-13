# 🧩 CONTEXTO PARA EL FRONTEND — SISTEMA INFLUENCER (RETO-300)

> Documento de referencia para el equipo de Frontend. Describe **qué hace el sistema**, **cómo está estructurada la API**, y **qué debe saber la UI** para consumirla correctamente.

---

## 1. Contexto del proyecto

### 1.1 Qué es

Plataforma **SaaS de automatización para campañas de Influencer Marketing con fin ecológico** (campaña **"Sembrando Perú"**). Reemplaza AppSheet/Excel con un flujo automatizado de:

- **Prospección con IA** — búsqueda de influencers reales de Instagram (vía **Apify**).
- **Validación humana** — un voluntario revisa cada perfil y confirma sus datos.
- **Contacto por email** — el sistema envía correos con plantillas personalizadas.
- **Agendamiento de reuniones** — el influencer elige un bloque y recibe el link de la videollamada (**Jitsi Meet**).
- **Notificaciones** — alertas al equipo por **Slack**.

### 1.2 Stack técnico del backend

| Capa | Tecnología |
|---|---|
| Framework | NestJS 11 + TypeScript |
| Base de datos | Prisma 6 + PostgreSQL (Supabase) |
| Autenticación | JWT (access token) + Refresh Tokens con rotación |
| Prospección IA | Apify (scraping Instagram, actor `apify~instagram-search-scraper`) |
| Videollamadas | Jitsi Meet (`https://meet.jit.si/...`) |
| Email | Nodemailer (SMTP) |
| Notificaciones | Webhooks de Slack |
| Documentación | Swagger (`/api/docs`) |

### 1.3 Roles de usuario

| Rol | Qué puede hacer |
|---|---|
| **ADMIN** | Todo. Gestión de usuarios, auditar influencers, cambiar estado de contacto, enviar correos (individual y masivo), ver el dashboard analítico, eliminar registros |
| **VOLUNTARIO** | Operativo. Ejecutar búsquedas IA, validar/editar influencers, gestionar su horario y disponibilidad, ver sus reuniones |

**Regla práctica:** los endpoints de **lectura/validación** están abiertos a ambos roles; los de **gestión crítica** (usuarios, correos, dashboard, eliminar, contactar) son **solo ADMIN**.

### 1.4 Flujo de negocio (embudo de conversión)

```
FASE 1 · PROSPECCIÓN (IA)
  Voluntario elige plantilla + escribe prompt → Apify busca perfiles reales
  de Instagram → se crean Influencers con estadoValidacion = PENDIENTE
  (si la IA encuentra email público → se auto-marca VALIDADO)

FASE 2 · VALIDACIÓN (humana)
  Voluntario revisa el perfil en Instagram → edita métricas reales →
  estadoValidacion = VALIDADO o RECHAZADO

FASE 3 · CONTACTO (email)
  ADMIN envía el correo con una plantilla (contiene el link de agendamiento) →
  estadoContacto = CORREO_ENVIADO

FASE 4 · AGENDAMIENTO (Jitsi Meet)
  El influencer abre el link → ve los bloques disponibles (endpoint público) →
  reserva uno → DisponibilidadCita = false + Reunion PENDIENTE + link Jitsi
  generado y enviado por correo → estadoContacto = REUNION_AGENDADA

FASE 5 · NOTIFICACIÓN (Slack)
  Slack avisa al equipo cuando se agenda una reunión, en cada operación de
  escritura (auditoría) y ante errores del sistema.
```

### 1.5 Glosario de estados (valores exactos)

| Estado | Valores posibles |
|---|---|
| `estadoValidacion` | `PENDIENTE`, `VALIDADO`, `RECHAZADO` |
| `estadoContacto` | `SIN_CONTACTAR`, `CORREO_ENVIADO`, `FORMULARIO_LLENADO`*, `REUNION_AGENDADA`, `RECHAZO_CONTACTO` |
| `estado` (reunión) | `PENDIENTE`, `REALIZADA`, `CANCELADA`, `NO_ASISTIO` |
| `estado` (usuario) | `ACTIVO`, `INACTIVO` |
| `estado` (consulta IA) | `PROCESANDO`, `COMPLETADO`, `ERROR` |
| `diaSemana` | `LUNES`, `MARTES`, `MIERCOLES`, `JUEVES`, `VIERNES`, `SABADO`, `DOMINGO` |
| `tematica` (filtro) | `SALUD`, `AMBIENTE`, `FAUNA`, `REFORESTACION`, `MEDIATICO`, `EDUCACION` |

> \* `FORMULARIO_LLENADO` existe en el catálogo de categorías pero el backend todavía no lo transiciona. No lo uses como valor de entrada.

---

## 2. Reglas globales de la API

### 2.1 Acceso

- **Base URL (local):** `http://localhost:3000`
- **Swagger / OpenAPI:** `GET /api/docs` (documentación interactiva autogenerada).
- **Formato de datos:** JSON. Content-Type `application/json`.
- **IDs:** todos los IDs son **UUID** generados por el backend (no los construyas en el frontend).

### 2.2 Autenticación

1. `POST /auth/login` devuelve `backendToken` (JWT, ~15 min) y `refreshToken` (7/30 días).
2. Envía el token en cada petición protegida:

```
Authorization: Bearer <backendToken>
```

3. Cuando el `backendToken` expire (HTTP 401), llama a `POST /auth/refresh` con `{ userId, refreshToken }` para obtener un par nuevo (**rotación**: el refresh token anterior queda revocado). Si el refresh falla, el usuario debe volver a iniciar sesión.
4. `POST /auth/logout` revoca el refresh token activo.
5. **Solo se permiten correos del dominio `@sembrandoperu.org`** para usuarios y login.
6. Hay **2 endpoints públicos** (sin token): `POST /reuniones` y `GET /disponibilidades/disponibles`. Todo lo demás requiere JWT.

### 2.3 Formato de respuestas ⚠️ (léelo antes de codificar)

Todas las respuestas pasan por un interceptor global. **Los formatos de éxito y error son diferentes.**

**Éxito (no paginado):**
```json
{
  "data": { },
  "mensaje": "Operación exitosa."
}
```
El `data` puede ser un objeto, un arreglo, o estar ausente (si el endpoint no devuelve nada, solo aparece `mensaje`).

**Éxito (paginado — usuarios e influencers):**
```json
{
  "data": {
    "data": [ ],
    "meta": { "total": 25, "page": 1, "limit": 20 }
  },
  "mensaje": "Operación exitosa."
}
```
> **IMPORTANTE:** para estos endpoints los ítems están en `res.data.data` y la paginación en `res.data.meta`.

**Error (HTTP ≠ 2xx):**
```json
{
  "statusCode": 404,
  "mensaje": "Influencer no encontrado.",
  "timestamp": "2026-08-02T12:00:00.000Z",
  "ruta": "/influencers/abc"
}
```
> Los errores **no** usan el wrapper `{ data }`. Detecta el error por el **status HTTP** o por la presencia de `statusCode`.

### 2.4 Validación y rate limiting

- **Validación estricta:** el backend rechaza campos desconocidos (`forbidNonWhitelisted`) y devuelve 400 con el mensaje del primer campo inválido.
- **Rate limiting global:** por defecto ~10 peticiones/60s por IP (configurable). El **login** tiene un límite propio de **5 intentos/min**.
- No confíes en los límites exactos: la UI debe manejar errores `429` de forma genérica.

### 2.5 Formatos de datos (fechas y números)

| Dato | Formato | Ejemplo |
|---|---|---|
| Hora de horario | `HH:mm` | `"08:00"` |
| Fecha/hora de disponibilidad (entrada) | `"YYYY-MM-DD HH:mm:ss"` (hora Perú) | `"2026-08-15 08:00:00"` |
| Fecha/hora de reunión (salida) | ISO 8601 | `"2026-08-15T13:00:00.000Z"` |
| Filtros de dashboard | `YYYY-MM-DD` | `?fechaInicio=2026-01-01` |
| Seguidores / publicaciones | **String** (no número) | `"15000"` |

---

## 3. Referencia de endpoints

Resumen rápido:

| Método | Ruta | Rol |
|---|---|---|
| POST | `/auth/login` | Público |
| POST | `/auth/refresh` | Público |
| POST | `/auth/logout` | Protegido |
| GET | `/usuarios` | ADMIN |
| POST | `/usuarios` | ADMIN |
| PATCH | `/usuarios/:id` | ADMIN |
| PATCH | `/usuarios/:id/desactivar` | ADMIN |
| GET | `/plantillas` | ADMIN, VOLUNTARIO |
| POST | `/plantillas` | ADMIN, VOLUNTARIO |
| GET | `/plantillas/:id` | ADMIN, VOLUNTARIO |
| PATCH | `/plantillas/:id` | ADMIN, VOLUNTARIO |
| DELETE | `/plantillas/:id` | ADMIN |
| POST | `/consultas-ia` | ADMIN, VOLUNTARIO |
| GET | `/consultas-ia` | ADMIN, VOLUNTARIO |
| GET | `/influencers` | ADMIN, VOLUNTARIO |
| POST | `/influencers` | ADMIN, VOLUNTARIO |
| GET | `/influencers/:id` | ADMIN, VOLUNTARIO |
| PATCH | `/influencers/:id/editar` | ADMIN, VOLUNTARIO |
| PATCH | `/influencers/:id/contactar` | ADMIN |
| DELETE | `/influencers/:id` | ADMIN |
| GET | `/horarios` | ADMIN (todas), VOLUNTARIO (suyos) |
| POST | `/horarios` | ADMIN, VOLUNTARIO |
| GET | `/horarios/mis-horarios` | VOLUNTARIO |
| PATCH | `/horarios/:id` | VOLUNTARIO |
| DELETE | `/horarios/:id` | VOLUNTARIO |
| POST | `/disponibilidades/generar` | VOLUNTARIO |
| DELETE | `/disponibilidades/limpiar` | VOLUNTARIO |
| POST | `/disponibilidades` | ADMIN, VOLUNTARIO |
| GET | `/disponibilidades/disponibles` | **Público** |
| GET | `/disponibilidades/mis-bloques` | VOLUNTARIO |
| PATCH | `/disponibilidades/:id/toggle` | VOLUNTARIO |
| DELETE | `/disponibilidades/:id` | VOLUNTARIO |
| POST | `/reuniones` | **Público** |
| GET | `/reuniones` | ADMIN, VOLUNTARIO |
| GET | `/reuniones/:id` | ADMIN, VOLUNTARIO |
| PATCH | `/reuniones/:id/estado` | ADMIN, VOLUNTARIO |
| POST | `/email/enviar` | ADMIN |
| POST | `/email/enviar-masivo` | ADMIN |
| GET | `/dashboard` | ADMIN |
| GET | `/categorias` | ADMIN, VOLUNTARIO |
| GET | `/categorias/admin` | ADMIN |

---

### 3.1 Auth

#### POST `/auth/login`
**Uso:** iniciar sesión y obtener tokens.

**Body:**
```json
{
  "email": "voluntario@sembrandoperu.org",
  "password": "Sembrando2026*",
  "recordar": false
}
```
`recordar` opcional: `true` → refresh token de 30 días; `false`/ausente → 7 días.

**Response 201:**
```json
{
  "data": {
    "usuario": {
      "id": "uuid",
      "nombre": "Carlos Pérez",
      "email": "voluntario@sembrandoperu.org",
      "role": "VOLUNTARIO"
    },
    "backendToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "a1b2c3d4e5f6..."
  },
  "mensaje": "Operación exitosa."
}
```
**Errores:** `400` validación (dominio no autorizado), `401` credenciales incorrectas o usuario inactivo, `429` demasiados intentos.

#### POST `/auth/refresh`
**Uso:** renovar el access token. **Rota** (revoca) el refresh token usado.

**Body:**
```json
{
  "userId": "uuid",
  "refreshToken": "a1b2c3d4e5f6..."
}
```
**Response 201:** misma estructura que login.

**Errores:** `400` validación, `401` refresh token inválido/expirado.

#### POST `/auth/logout`
**Uso:** cerrar sesión y revocar el refresh token. Requiere JWT.

**Body:**
```json
{ "refreshToken": "a1b2c3d4e5f6..." }
```
**Response 201:**
```json
{ "data": { "mensaje": "Sesión cerrada exitosamente." }, "mensaje": "Operación exitosa." }
```

---

### 3.2 Usuarios (solo ADMIN)

#### GET `/usuarios`
**Uso:** listar usuarios con filtros y paginación.

**Query:** `?page=1&limit=10&estado=ACTIVO&roleId=2`

**Response 200 (paginado):**
```json
{
  "data": {
    "data": [
      { "id": "uuid", "email": "v@sembrandoperu.org", "nombre": "Carlos", "estado": "ACTIVO", "roleId": 2, "createdAt": "2026-06-01T10:00:00.000Z" }
    ],
    "meta": { "total": 1, "page": 1, "limit": 10 }
  },
  "mensaje": "Operación exitosa."
}
```

#### POST `/usuarios`
**Uso:** crear un usuario. La contraseña inicial es temporal (configurada en el servidor, igual para todos).

**Body:**
```json
{ "email": "voluntario@sembrandoperu.org", "nombre": "Carlos Pérez", "roleId": 2 }
```
`roleId`: `1` = ADMIN, `2` = VOLUNTARIO.

**Response 201:**
```json
{
  "data": { "id": "uuid", "email": "voluntario@sembrandoperu.org", "nombre": "Carlos Pérez", "estado": "ACTIVO", "roleId": 2 },
  "mensaje": "Operación exitosa."
}
```
**Errores:** `400` correo ya registrado, `400` correo fuera de dominio.

#### PATCH `/usuarios/:id`
**Uso:** actualizar `email`, `nombre` y/o `roleId`. Cuerpo parcial.

**Body:** `{ "nombre": "Nuevo nombre" }`

#### PATCH `/usuarios/:id/desactivar`
**Uso:** baja lógica → `estado = "INACTIVO"`. El usuario no podrá iniciar sesión.

**Response 200:**
```json
{
  "data": { "id": "uuid", "email": "v@sembrandoperu.org", "nombre": "Carlos", "estado": "INACTIVO", "roleId": 2 },
  "mensaje": "Operación exitosa."
}
```

---

### 3.3 Plantillas (correos)

> Las plantillas tienen placeholders que el backend reemplaza al enviar: `{{nombre_influencer}}`, `{{nombre_voluntario}}`, `{{link_agendamiento}}`.

#### GET `/plantillas`
**Uso:** listar plantillas.

**Response 200:**
```json
{
  "data": [
    { "id": "uuid", "nombre": "Moda Verano", "descripcion": "Campaña verano", "asunto": "Propuesta de colaboración", "cuerpo": "<p>Hola {{nombre_influencer}}...</p>" }
  ],
  "mensaje": "Operación exitosa."
}
```

#### POST `/plantillas`
**Uso:** crear plantilla.

**Body:**
```json
{
  "nombre": "Moda Verano",
  "descripcion": "Campaña verano",
  "asunto": "Propuesta de colaboración",
  "cuerpo": "<p>Hola {{nombre_influencer}}...</p>"
}
```

#### GET `/plantillas/:id` / PATCH `/plantillas/:id` / DELETE `/plantillas/:id`
- **GET:** detalle de una plantilla.
- **PATCH:** actualiza campos parciales.
- **DELETE (ADMIN):** elimina. Respuesta `{ "mensaje": "Operación exitosa." }`.

**Errores:** `400` nombre duplicado, `404` no encontrada.

---

### 3.4 Consultas IA (prospección)

#### POST `/consultas-ia`
**Uso:** ejecutar una búsqueda de influencers en Instagram vía Apify. Crear la consulta + los influencers nuevos (deduplicación automática por usuario de Instagram).

**Body:**
```json
{
  "descripcionPrompt": "influencers de fitness en Perú",
  "cantidadSolicitada": 20,
  "rangoSeguidores": "10k - 50k",
  "plantillaId": "uuid"
}
```

**Response 201:**
```json
{
  "data": {
    "consulta": {
      "id": "uuid",
      "descripcionPrompt": "influencers de fitness en Perú",
      "cantidadSolicitada": 18,
      "rangoSeguidores": "10k - 50k",
      "estado": "COMPLETADO",
      "fecha": "2026-08-02T12:00:00.000Z",
      "voluntarioId": "uuid",
      "plantillaId": "uuid"
    },
    "influencers": [
      {
        "id": "uuid",
        "nombre": "Juan Pérez",
        "usuarioIg": "juanperez",
        "linkIg": "https://instagram.com/juanperez",
        "seguidores": "25000",
        "cantidad_post": "120",
        "biografia": "Fitness coach",
        "email": "juan@mail.com",
        "estadoValidacion": "VALIDADO",
        "mensajePersonalizado": null
      }
    ],
    "resumen": {
      "totalPerfilesReales": 20,
      "nuevos": 18,
      "duplicados": 2,
      "conEmail": 5
    }
  },
  "mensaje": "Operación exitosa."
}
```

**Notas:** la búsqueda tarda (Apify); puede tardar hasta ~60s. Si no encuentra perfiles, o todos ya existen, responde `404`. La cantidad guardada (`cantidadSolicitada`) corresponde a los **nuevos** encontrados, no a la solicitada.

#### GET `/consultas-ia`
**Uso:** listar consultas. **ADMIN ve todas; VOLUNTARIO solo las suyas.**

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "descripcionPrompt": "influencers de fitness en Perú",
      "cantidadSolicitada": 18,
      "rangoSeguidores": "10k - 50k",
      "estado": "COMPLETADO",
      "fecha": "2026-08-02T12:00:00.000Z",
      "voluntarioId": "uuid",
      "plantillaId": "uuid",
      "voluntario": { "id": "uuid", "nombre": "Carlos Pérez" },
      "plantilla": { "id": "uuid", "nombre": "Moda Verano" }
    }
  ],
  "mensaje": "Operación exitosa."
}
```

---

### 3.5 Influencers

#### GET `/influencers`
**Uso:** listar influencers con filtros y paginación.

**Query:**
```
?estadoValidacion=PENDIENTE&estadoContacto=SIN_CONTACTAR&tematica=SALUD&page=1&limit=20
```

**Response 200 (paginado):**
```json
{
  "data": {
    "data": [
      {
        "id": "uuid",
        "nombre": "Juan Pérez",
        "usuarioIg": "juanperez",
        "linkIg": "https://instagram.com/juanperez",
        "email": "juan@mail.com",
        "seguidores": "25000",
        "cantidad_post": "120",
        "biografia": "Fitness coach",
        "estadoValidacion": "PENDIENTE",
        "estadoContacto": "SIN_CONTACTAR",
        "createdAt": "2026-08-02T12:00:00.000Z",
        "consultaIa": { "id": "uuid", "voluntarioId": "uuid" },
        "validadoPor": { "id": "uuid", "nombre": "Carlos Pérez" }
      }
    ],
    "meta": { "total": 1, "page": 1, "limit": 20 }
  },
  "mensaje": "Operación exitosa."
}
```

#### POST `/influencers`
**Uso:** crear un influencer manualmente (sin Apify). El usuario actual queda como `validadoPor`.

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "usuarioIg": "juanperez",
  "linkIg": "https://instagram.com/juanperez",
  "email": "juan@mail.com",
  "phone": "+51999000000",
  "seguidores": "25000",
  "cantidad_post": "120",
  "biografia": "Fitness coach",
  "mensajePersonalizado": "Hola Juan...",
  "estadoValidacion": "PENDIENTE"
}
```
Todos los campos excepto `nombre`, `usuarioIg` y `linkIg` son opcionales.

#### GET `/influencers/:id`
**Uso:** detalle. Incluye la consulta IA y la plantilla de origen.

#### PATCH `/influencers/:id/editar`
**Uso:** editar campos (es la acción de **validación**: cambiar seguidores/bio/`estadoValidacion`). Cuerpo parcial. El usuario actual queda como `validadoPor`.

**Body:** `{ "estadoValidacion": "VALIDADO", "seguidores": "18000", "biografia": "..." }`

#### PATCH `/influencers/:id/contactar` (solo ADMIN)
**Uso:** cambiar el `estadoContacto` manualmente (recuperar estados del embudo).

**Body:**
```json
{ "estadoContacto": "CORREO_ENVIADO" }
```

#### DELETE `/influencers/:id` (solo ADMIN)
**Uso:** eliminar un influencer.

**Response 200:**
```json
{ "data": { "mensaje": "Influencer eliminado correctamente." }, "mensaje": "Operación exitosa." }
```

**Errores comunes:** `404` no encontrado.

---

### 3.6 Horarios (horario teórico del voluntario)

> Es el **horario base** semanal. A partir de él se generan los bloques de disponibilidad.

#### GET `/horarios`
**Uso:** listar horarios. **ADMIN ve todos; VOLUNTARIO solo los suyos.**

#### POST `/horarios`
**Uso:** registrar el horario de un día. **Solo se permite un horario por día** (si ya existe uno para ese día, responde 400: "Edítalo o elimínalo antes de crear otro").

**Body:**
```json
{ "diaSemana": "LUNES", "horaInicio": "08:00", "horaFin": "13:00" }
```

**Response 201:**
```json
{
  "data": { "id": "uuid", "diaSemana": "LUNES", "horaInicio": "08:00", "horaFin": "13:00", "voluntarioId": "uuid" },
  "mensaje": "Operación exitosa."
}
```

#### GET `/horarios/mis-horarios` (VOLUNTARIO)
**Uso:** lista solo los horarios del usuario logueado. Mismos campos.

#### PATCH `/horarios/:id` (VOLUNTARIO)
**Uso:** actualizar un horario **propio** (un voluntario no puede modificar el de otro → 400).

#### DELETE `/horarios/:id` (VOLUNTARIO)
**Uso:** eliminar un horario propio. Respuesta `{ "mensaje": "Operación exitosa." }`.

---

### 3.7 Disponibilidades (bloques reales de 60 min)

> Los bloques son de **60 minutos** y se generan a partir del horario del voluntario.

#### POST `/disponibilidades/generar` (VOLUNTARIO)
**Uso:** genera bloques de 60 min para el **día de hoy de la próxima semana** según el horario configurado para ese día. Si hoy no tiene horario configurado → 400.

**Body:**
```json
{ "zonaHoraria": "America/Lima" }
```

**Response 201:**
```json
{ "data": { "creados": 5, "existentes": 1 }, "mensaje": "Operación exitosa." }
```

#### DELETE `/disponibilidades/limpiar` (VOLUNTARIO)
**Uso:** elimina los bloques vencidos del usuario que no tengan reunión.

**Response 200:**
```json
{ "data": { "eliminados": 3 }, "mensaje": "Operación exitosa." }
```

#### POST `/disponibilidades`
**Uso:** crear un bloque manual (20/60 min puntual).

**Body:**
```json
{ "fechaHora": "2026-08-15 08:00:00", "disponible": true }
```
`disponible` opcional (default `true`). Si ya existe un bloque en esa fecha/hora → 400.

**Response 201:**
```json
{
  "data": { "id": "uuid", "fechaHora": "2026-08-15T13:00:00.000Z", "disponible": true, "voluntarioId": "uuid" },
  "mensaje": "Operación exitosa."
}
```

#### GET `/disponibilidades/disponibles` 🔓 **PÚBLICO**
**Uso:** ver bloques libres. **Este es el endpoint que consume el influencer** (desde la página `/agendar` del frontend, sin iniciar sesión).

**Query (todos opcionales):**
```
?voluntarioId=uuid&desde=2026-08-15 00:00:00&hasta=2026-08-16 00:00:00
```
Por defecto devuelve solo los `disponible = true` desde la fecha actual.

**Response 200:**
```json
{
  "data": [
    { "id": "uuid", "fechaHora": "2026-08-15T13:00:00.000Z", "voluntario": { "id": "uuid", "nombre": "Carlos Pérez" } }
  ],
  "mensaje": "Operación exitosa."
}
```

#### GET `/disponibilidades/mis-bloques` (VOLUNTARIO)
**Uso:** todos los bloques del usuario logueado (para administrar su agenda).

**Response 200:**
```json
{
  "data": [ { "id": "uuid", "fechaHora": "2026-08-15T13:00:00.000Z", "disponible": true } ],
  "mensaje": "Operación exitosa."
}
```

#### PATCH `/disponibilidades/:id/toggle` (VOLUNTARIO)
**Uso:** activar/desactivar un bloque propio. No puede modificar bloques de otros (400).

**Response 200:**
```json
{ "data": { "id": "uuid", "fechaHora": "2026-08-15T13:00:00.000Z", "disponible": false }, "mensaje": "Operación exitosa." }
```

#### DELETE `/disponibilidades/:id` (VOLUNTARIO)
**Uso:** eliminar un bloque propio. **No se puede eliminar si tiene reunión** (400).

---

### 3.8 Reuniones

#### POST `/reuniones` 🔓 **PÚBLICO**
**Uso:** el influencer reserva un bloque de disponibilidad. Esta es la **acción clave del embudo**: crea la reunión, marca el bloque como ocupado y cambia el influencer a `REUNION_AGENDADA` (todo en una transacción). Luego genera el link de Jitsi, envía el correo con el link y notifica a Slack.

**Body:**
```json
{
  "email": "juan@mail.com",
  "disponibilidadCitaId": "uuid",
  "duracionMinutos": 60,
  "zonaHoraria": "America/Lima"
}
```
- `email` debe **coincidir con el email de un influencer registrado** (400 si no).
- `duracionMinutos` opcional (mín. 10, default 20 — aunque el flujo normal usa bloques de 60).
- `zonaHoraria` opcional: se usa para formatear la fecha en el correo.

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "fechaHora": "2026-08-15T13:00:00.000Z",
    "duracionMinutos": 60,
    "estado": "PENDIENTE",
    "googleMeetLink": "https://meet.jit.si/Reto300-8a7d...",
    "disponibilidadCitaId": "uuid",
    "createdAt": "2026-08-02T12:00:00.000Z"
  },
  "mensaje": "Operación exitosa."
}
```
> ⚠️ El campo se llama `googleMeetLink` en la API por herencia, pero el link real es de **Jitsi** (`meet.jit.si`). En la UI puedes mostrarlo como "link de la videollamada".

**Errores:** `400` correo no corresponde a influencer registrado / bloque ya reservado, `404` bloque no existe.

#### GET `/reuniones`
**Uso:** listar reuniones. **ADMIN ve todas; VOLUNTARIO solo las suyas** (las asociadas a sus bloques).

**Query:** `?estado=PENDIENTE`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "fechaHora": "2026-08-15T13:00:00.000Z",
      "duracionMinutos": 60,
      "estado": "PENDIENTE",
      "googleMeetLink": "https://meet.jit.si/Reto300-...",
      "createdAt": "2026-08-02T12:00:00.000Z",
      "disponibilidadCita": { "id": "uuid", "voluntario": { "id": "uuid", "nombre": "Carlos Pérez" } },
      "influencer": { "id": "uuid", "nombre": "Juan Pérez", "usuarioIg": "juanperez", "email": "juan@mail.com" }
    }
  ],
  "mensaje": "Operación exitosa."
}
```

#### GET `/reuniones/:id`
**Uso:** detalle de una reunión (incluye email/phone del influencer y email del voluntario).

#### PATCH `/reuniones/:id/estado`
**Uso:** actualizar el estado de la reunión (asistencia/resultado).

**Body:**
```json
{ "estado": "REALIZADA" }
```
Valores válidos: `REALIZADA`, `CANCELADA`, `NO_ASISTIO`. **No se puede cambiar el estado de una reunión ya `REALIZADA`** (400).

**Response 200:**
```json
{
  "data": { "id": "uuid", "fechaHora": "2026-08-15T13:00:00.000Z", "estado": "REALIZADA", "googleMeetLink": "https://meet.jit.si/Reto300-..." },
  "mensaje": "Operación exitosa."
}
```

---

### 3.9 Email (solo ADMIN)

#### POST `/email/enviar`
**Uso:** enviar el correo de contacto a un influencer usando una plantilla. **Requisitos:** el influencer debe tener email y estar `VALIDADO`; si ya está en `REUNION_AGENDADA` no se envía (400). Al enviar, el influencer pasa a `CORREO_ENVIADO`.

**Body:**
```json
{ "influencerId": "uuid", "plantillaId": "uuid" }
```

**Response 201:**
```json
{ "data": { "influencerId": "uuid", "email": "juan@mail.com", "exitoso": true }, "mensaje": "Operación exitosa." }
```

**Errores:** `404` influencer/plantilla no encontrada, `400` sin email / no validado / ya con reunión.

#### POST `/email/enviar-masivo`
**Uso:** enviar a varios influencers a la vez.

**Body:**
```json
{ "influencerIds": ["uuid1", "uuid2"], "plantillaId": "uuid" }
```

**Response 201:**
```json
{
  "data": [
    { "influencerId": "uuid1", "email": "a@mail.com", "exitoso": true },
    { "influencerId": "uuid2", "email": "b@mail.com", "exitoso": false, "error": "El influencer no está validado." }
  ],
  "mensaje": "Operación exitosa."
}
```
> Cada resultado es independiente; revisa `exitoso` por ítem. Si SMTP no está configurado, el sistema **simula el envío** pero igual marca `CORREO_ENVIADO`.

---

### 3.10 Dashboard (solo ADMIN)

#### GET `/dashboard`
**Uso:** KPIs y datos para gráficos del embudo.

**Query:** `?fechaInicio=2026-01-01&fechaFin=2026-06-30` (opcionales).

**Response 200:**
```json
{
  "data": {
    "kpis": {
      "totalInfluencers": 120,
      "pendientes": 40,
      "validados": 60,
      "rechazados": 20,
      "correoEnviado": 30,
      "reunionAgendada": 10,
      "sinContactar": 80,
      "reunionesHoy": 2,
      "reunionesSemana": 8,
      "reunionesMes": 15
    },
    "charts": {
      "embudo": {
        "title": "Embudo de Conversión",
        "labels": ["PENDIENTE", "VALIDADO", "CORREO_ENVIADO", "REUNIÓN"],
        "datasets": [{ "label": "Influencers", "data": [40, 20, 30, 10] }]
      },
      "topVoluntarios": {
        "title": "Top Voluntarios — Validaciones",
        "labels": ["Carlos Pérez"],
        "datasets": [{ "label": "Validaciones", "data": [25] }]
      },
      "usoPlantillas": {
        "title": "Uso de Plantillas",
        "labels": ["Moda Verano"],
        "datasets": [{ "label": "Consultas IA", "data": [12] }]
      }
    }
  },
  "mensaje": "Operación exitosa."
}
```

---

### 3.11 Categorías (catálogos para combos)

#### GET `/categorias`
**Uso:** obtener valores para combos/selectores, agrupados por tipo.

**Query:** `?tipo=ESTADO_VALIDACION,ESTADO_CONTACTO` (opcional; si se omite devuelve todos).

**Response 200:**
```json
{
  "data": {
    "ESTADO_VALIDACION": [
      { "valor": "PENDIENTE", "etiqueta": "Pendiente", "orden": 1 },
      { "valor": "VALIDADO", "etiqueta": "Validado", "orden": 2 },
      { "valor": "RECHAZADO", "etiqueta": "Rechazado", "orden": 3 }
    ],
    "ESTADO_CONTACTO": [
      { "valor": "SIN_CONTACTAR", "etiqueta": "Sin contactar", "orden": 1 }
    ]
  },
  "mensaje": "Operación exitosa."
}
```

#### GET `/categorias/admin` (solo ADMIN)
**Uso:** todas las categorías en plano, incluyendo `id`.

**Response 200:**
```json
{
  "data": [
    { "id": "uuid", "tipo": "ESTADO_VALIDACION", "valor": "PENDIENTE", "etiqueta": "Pendiente", "orden": 1 }
  ],
  "mensaje": "Operación exitosa."
}
```

---

## 4. Notas y recomendaciones para el frontend

### 4.1 Página pública del influencer (`/agendar`)

Flujo para el influencer (sin autenticación):
1. El correo de contacto contiene un link: `FRONTEND_URL/agendar?email=<email_del_influencer>`.
2. La página lee `email` del query y llama a `GET /disponibilidades/disponibles` para mostrar los bloques libres.
3. El influencer elige un bloque y la página llama a `POST /reuniones` con `{ email, disponibilidadCitaId, zonaHoraria }`.
4. Se muestra confirmación con el link de la videollamada (Jitsi).

### 4.2 Sugerencia de pantallas por rol

**Comunes (login):** pantalla de login → guarda `backendToken` y `refreshToken` (localStorage/sessionStorage), maneja renovación con `refresh`.

**VOLUNTARIO:**
- Dashboard operativo simple (lista de sus reuniones del día).
- Prospección: formulario de búsqueda IA + lista de consultas.
- Validación: lista de influencers PENDIENTE → editar y marcar VALIDADO/RECHAZADO.
- Agenda: configuración de horarios → generar disponibilidad → gestionar bloques → ver reuniones.

**ADMIN:**
- Gestión de usuarios (CRUD + desactivar).
- Plantillas (CRUD).
- Influencers (ver/editar/eliminar + cambiar estado de contacto).
- Envío de correos (individual y masivo).
- Dashboard analítico.
- Reuniones (todas).

### 4.3 Fechas y zona horaria

- Los bloques se guardan en UTC; la UI debe convertirlos a la zona local (o a `America/Lima`) para mostrarlos.
- Al **enviar** una fecha de disponibilidad usa el formato `"YYYY-MM-DD HH:mm:ss"`.
- Al **recibir** fechas de reunión/bloques recibes ISO 8601 (con `Z`); conviértelas con `Intl.DateTimeFormat` según la zona horaria que elijas mostrar.
- En `POST /reuniones` envía `zonaHoraria` con la del navegador (`Intl.DateTimeFormat().resolvedOptions().timeZone`) para que el correo muestre la hora correcta.

### 4.4 Buenas prácticas

- **No hardcodees estados**: usa `GET /categorias` para poblar combos y badges (etiquetas amigables).
- **Paginación**: en `/usuarios` e `/influencers` los datos viven en `res.data.data` y la paginación en `res.data.meta`.
- **Envoltorio de errores**: interceptor central que detecte `statusCode` o status HTTP no 2xx y muestre `mensaje`.
- **Refresh automático**: ante un 401, intenta `POST /auth/refresh` una vez y reintenta la petición original; si falla, redirige a login.
- **Rate limiting**: ante 429, espera y reintenta (no spamees el login).
- El campo `googleMeetLink` de las reuniones contiene el link de **Jitsi**; nómbralo en la UI como "link de la reunión".
