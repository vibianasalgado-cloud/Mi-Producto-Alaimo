---
name: nueva-entidad
description: Agrega una entidad nueva por usuario (tabla con RLS, rutas de API, página con lista y formulario) y verifica con dos usuarios que cada uno ve solo lo suyo. Úsala cuando pidan "una nueva entidad", "que el usuario pueda registrar X" o una tabla nueva ligada a la sesión.
argument-hint: <nombre-entidad> <dato1, dato2, ...>
---

# nueva-entidad

Argumentos: nombre de la entidad (plural, minúsculas, sin tildes, p. ej. `clientes`) y sus datos (nombre, tipo, si es obligatorio, longitud máxima). Si falta alguno de los dos, pregúntalo antes de empezar.

El modelo de referencia es `interesados`:
- migración: `supabase/migrations/20261008120000_interesados.sql`
- API: `app/api/interesados/route.ts`
- página: `app/mi-cuenta/page.tsx`

Léelos y copia su estilo. Respeta `CLAUDE.md`: texto en español (es-CO), no cambiar el diseño (reusa las clases de `app/auth.css`), no hacer commits, el navegador nunca habla con la base.

## 1. Migración (tabla + usuario + RLS, todo en el mismo archivo)

Crea `supabase/migrations/<AAAAMMDDHHMMSS>_<entidad>.sql` (timestamp mayor al último existente):

- `id bigint generated always as identity primary key`
- `user_id uuid not null default auth.uid() references auth.users(id) on delete cascade` (lo pone la base; el cliente nunca lo envía)
- una columna por dato, con `CHECK` de longitud (`length(x) between 1 and N` si es obligatorio; `x is null or length(x) <= N` si es opcional)
- `created_at timestamptz not null default now()`
- `create index <entidad>_user_id_idx on public.<entidad> (user_id);`
- `alter table public.<entidad> enable row level security;`
- políticas `to authenticated` con `(select auth.uid())`: inserta (`with check`), lee, edita (`using` + `with check`) y borra, todas con `user_id = (select auth.uid())`
- política "admin lee todo" con el correo del admin del JWT (el mismo que usan las migraciones existentes; ver CLAUDE.md, sección Seguridad)
- sin políticas para `anon`

## 2. Aplicarla

Aplícala tú con la CLI de Supabase (`npx supabase db push` desde la raíz; el proyecto remoto es `otytsfrlyhxmoebyxpwa`). Después comprueba con `list_migrations` del MCP de Supabase que quedó registrada y con SQL de solo lectura que `relrowsecurity` es `true` y están las políticas esperadas. Si la CLI no está vinculada o pide login, dile al usuario qué ejecutar; no uses el MCP `apply_migration` como atajo sin avisar.

## 3. Rutas de API

Crea `app/api/<entidad>/route.ts` copiando `app/api/interesados/route.ts`:
- `createClient()` de `@/lib/supabase/server` (llave pública + sesión, para que aplique RLS). Nunca `lib/supabase/admin`.
- `GET`: 401 `{error:'Sin sesión.'}` si no hay usuario; si hay, `select('*')` ordenado por `created_at` descendente.
- `POST`: 401 sin sesión; valida con las mismas reglas que los `CHECK` (obligatorios, longitud máxima, formato de correo si aplica) y responde 400 con mensajes en español; inserta solo las columnas de datos (sin `user_id`); 500 con mensaje genérico en error.
- Si el usuario pide editar/borrar, añade `PATCH`/`DELETE` por `id` con la misma sesión (las políticas ya filtran por dueño).

## 4. Página

Crea `app/<ruta>/page.tsx` (cliente) copiando `app/mi-cuenta/page.tsx`: formulario arriba, tabla "Mis registros (n)" abajo, `fetch` a la API, 401 → `/login?next=/<ruta>`. Mejoras sobre la referencia: deshabilita el botón mientras guarda (evita doble envío) y limpia el formulario solo tras éxito. React escapa el texto; no uses `innerHTML`.
- Si la página es independiente, añade su ruta al `matcher` de `proxy.ts` para exigir sesión.
- Si solo se agrega a `/mi-cuenta`, añade la sección ahí sin tocar el resto.
- Si el admin debe verla, añade la lectura en `app/api/admin/datos/route.ts` (única ruta que puede usar la llave secreta).

## 5. Verificar con dos usuarios

Corre `npx tsc --noEmit` primero. Luego, con el servidor local (`preview_start` "next-dev"; si el puerto 3000 ya está ocupado por otro servidor `next-dev`, úsalo sin tocarlo) y el navegador integrado:

1. Registra a A (`a@prueba.com`, contraseña de prueba) en `/registro`; crea dos registros esperando a que el formulario se limpie entre uno y otro; confirma "(2)".
2. Cierra sesión; confirma que la ruta sin sesión redirige a `/login?next=…`.
3. Registra a B (`b@prueba.com`) y entra; confirma "(0)" y que `GET /api/<entidad>` devuelve `filas: []`.
4. Opcional: con B crea uno y confirma que A sigue viendo solo los suyos.

Notas: Supabase rechaza dominios sin MX (`test.com`, `example.com`); `prueba.com` funcionó. "Confirm email" está desactivado, así que el registro entra directo. Las contraseñas de prueba son solo para estas cuentas locales: no las repitas en respuestas salvo que las pidan, y si las cuentas ya existen, inicia sesión en vez de registrar.

## Cierre

Reporta una tabla paso → resultado, indica que quedaron usuarios y filas de prueba en el proyecto remoto y pregunta si se limpian (no borres sin confirmación). No hagas commit ni cargues más datos de prueba sin que lo pidan. Si algo cambia en la arquitectura, ofrece actualizar `CLAUDE.md`.
