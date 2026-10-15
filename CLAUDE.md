# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## La app

1. Quién usa mi app: Personas que desean un producto de financiacion
2. Qué registra (entidad principal): Clientes interesados en un credito
3. Sus datos (3 a 5): ofrecimiento de financiacion en comercios, como hacerlo y donde compar 
4. Qué ve cada uno: el usuario ve solo lo suyo; el admin ve todo
5. Qué quiero probar: que las personas que entran a dejar los datos quieren ser contactados para obtener un credito

## Reglas del proyecto

- Next.js con rutas de API. El navegador nunca habla con la base.
- La llave secreta solo se usa en las rutas del panel admin.
- El panel admin solo es para los emails de ADMIN_EMAILS.
- Las rutas de la app consultan la base con la llave pública y la sesión del usuario, siempre en el servidor, para que se aplique el RLS.
- Toda tabla nueva tiene RLS activo, con reglas en la misma migración.
- Los cambios en la base van como migración en supabase/migrations/ y los aplicas tú con la CLI de Supabase.
- No cambies el diseño sin que te lo pida.
- No hagas commits ni cargues datos de prueba sin que te lo pida.
- Es un prototipo: pagos e IA se simulan.

## Qué es

Landing educativa "Crédito en comercios" (Nequi, en español) para validar la hipótesis de arriba, más cuentas de usuario y un panel admin. Next.js 16 (App Router, TypeScript) + Supabase. La reacción de los clientes a la landing se documenta en `README.md`.

## Comandos

```bash
npm run dev      # http://localhost:3000 (configuración "next-dev" en .claude/launch.json)
npm run build    # compila y revisa tipos; no hay tests ni linter
npx tsc --noEmit
```

No hay Python en la máquina; para scripts auxiliares usar Node. Variables en `.env.local` (ignorado por git): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` (solo admin) y `ADMIN_EMAILS` (correos separados por coma).

## Arquitectura

- **Landing (`/`)**: `app/page.tsx` inyecta el HTML original (`app/_landing/body.html`, estilos en `app/landing.css`) y `app/LandingScripts.tsx` (cliente) maneja el tema y envía los formularios por `fetch` a `/api/interes` (→ `signups`) y `/api/feedback` (→ `feedback`). Los marcadores `REVISAR` son textos pendientes de Legal/Producto; no los quites sin confirmación. Es pública.
- **Auth**: `/registro` y `/login` usan `app/AuthForm.tsx` → `/api/auth/{registro,login,logout}`. La sesión vive en cookies (`@supabase/ssr`); el navegador nunca recibe llaves ni habla con Supabase.
- **`/mi-cuenta`** (usuario): formulario + lista de sus registros en `interesados` vía `/api/interesados`.
- **`/admin`**: lee todo (`signups`, `feedback`, `interesados`) vía `/api/admin/datos`, muestra cuántos quieren ser contactados y exporta signups a CSV.
- `app/auth.css` es el CSS de las páginas de cuenta/admin; `app/landing.css` el de la landing (se importan por separado; no mezclar).

## Seguridad

- `proxy.ts` (Next 16, antes "middleware"): refresca la sesión; sin sesión, `/mi-cuenta` y `/admin` → `/login?next=…`; en `/admin` quien no esté en `ADMIN_EMAILS` → `/mi-cuenta`. Es solo una capa: cada ruta de API vuelve a comprobar.
- `lib/supabase/server.ts` → cliente con llave pública + sesión (aplica RLS). `lib/supabase/admin.ts` → llave secreta (`server-only`), importable solo desde `app/api/admin/**`. `lib/admin.ts` → `isAdmin()` lee `ADMIN_EMAILS`.
- RLS (`supabase/migrations/`): `signups`/`feedback` cualquiera inserta; `interesados` cada usuario solo lo suyo (`user_id = auth.uid()`, default de la columna). Las políticas "admin lee" usan el correo del JWT (`vibiana.salgado@gmail.com`) como segunda defensa; si cambia el admin, actualizar también esas políticas.

## Supabase

- Proyecto remoto: ref `otytsfrlyhxmoebyxpwa`. Verificar migraciones aplicadas con `list_migrations`; el archivo y el remoto pueden desfasarse.
- Auth por correo: "Enable email provider" activo y "Confirm email" desactivado (con él activo el plan gratuito da "email rate limit exceeded"). Supabase rechaza dominios sin MX (`test.com`, `example.com`).

## Convenciones

- Texto de interfaz y errores en español (es-CO).
- Las API validan entrada igual que los CHECK de las tablas (longitudes, formato de correo) y devuelven mensajes en español.
- Al mostrar datos de usuarios, no usar `innerHTML` (React escapa por defecto); el CSV del admin neutraliza fórmulas (`csvCell`).
- `.claude/worktrees/` contiene copias de trabajo de versiones alternativas de la landing en HTML estático (`landing-v2`, `credito-pago-directo-v3`); `server.ps1` las sirve con los otros puertos de `launch.json`.
