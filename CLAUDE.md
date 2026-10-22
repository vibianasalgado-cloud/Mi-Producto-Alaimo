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
- **`/admin/metricas`**: usuarios, activación (≥1 `interesados`) y retorno (≥2 días en `visits`) + gráfico semanal, vía `/api/admin/metricas` (llave secreta). `visits` guarda una fila por usuario por día (hora de Bogotá); `app/RegistrarVisita.tsx` la registra con `POST /api/visitas` al abrir `/mi-cuenta`, `/mis-comentarios` y `/admin`. También muestra contacto (`quiere_ser_contactado`), intención concreta y, sobre los visitantes únicos de la landing, el % de interesados. `landing_visits` guarda una fila por visitante anónimo (cookie `vid`) por día vía `POST /api/visitas-landing` (inserta con llave pública; sin `ON CONFLICT`, porque el anónimo no puede leer; no cuenta al admin ni a bots); solo el admin la lee.
- `app/auth.css` es el CSS de las páginas de cuenta/admin; `app/landing.css` el de la landing (se importan por separado; no mezclar).

## Métricas

Dashboard en `/admin/metricas`; el cálculo vive en `app/api/admin/metricas/route.ts` (llave secreta, solo admin). Hipótesis a probar: cuántos clientes están interesados en un crédito y quieren ser contactados. "Total" = usuarios registrados en Auth; las fechas usan hora de Bogotá y las semanas empiezan el lunes. Los porcentajes se redondean a 1 decimal y valen 0 si el divisor es 0. Con pocos usuarios, leer el "N de TOTAL" antes que el porcentaje.

| Métrica | Pregunta que responde | Cómo se calcula |
|---|---|---|
| Usuarios registrados | ¿Cuánta gente creó cuenta? | Cantidad de usuarios de Auth (`listUsers`, paginado). |
| Activación | ¿Los que se registran dejan algún interés? | Usuarios distintos con ≥1 fila en `interesados` ÷ usuarios registrados. |
| Retorno | ¿Vuelven a la app? | Usuarios con `visits` en ≥2 días distintos ÷ usuarios registrados. `visits` (una fila por usuario por día) la llena `RegistrarVisita` al abrir `/mi-cuenta`, `/mis-comentarios` y `/admin`; solo cuenta desde que existe la tabla. |
| Quieren ser contactados | De los que tienen cuenta, ¿cuántos piden que los llamen? | Usuarios distintos con ≥1 `interesados.quiere_ser_contactado = true` ÷ usuarios registrados. |
| Contacto entre quienes dejaron datos | ¿El interés se vuelve permiso de contacto, o solo curiosidad? | Mismos usuarios con contacto ÷ usuarios con ≥1 registro en `interesados`. |
| Intención concreta | ¿Quien pide contacto tiene una compra en mente? | Solicitudes de contacto (filas con `quiere_ser_contactado = true`) con `como_hacerlo` o `donde_comprar` lleno ÷ total de solicitudes de contacto. Cuenta filas, no usuarios. |
| Visitantes de la landing | ¿Cuánta gente ve la landing? | Visitantes únicos (`visitor_id` distintos) en `landing_visits`. La cookie `vid` es anónima; una fila por visitante por día vía `POST /api/visitas-landing`; no cuenta al admin ni a bots. Solo desde que existe la tabla. |
| Interesados sobre visitantes | De los que ven la landing, ¿qué parte deja un registro de interés? | Usuarios con ≥1 `interesados` ÷ visitantes únicos. Es una razón entre dos conteos sin vincular a la persona (el visitante anónimo no se une a su cuenta), así que puede pasar de 100 % al inicio. |
| Contacto sobre visitantes | De los que ven la landing, ¿qué parte pide contacto? | Usuarios con contacto ÷ visitantes únicos (misma salvedad). |
| Por semana (gráfico, 8 semanas) | ¿Crece la entrada de gente y vuelve a usar la app? | `nuevos` = usuarios por semana de `created_at`; `entraron` = usuarios distintos con alguna fila en `visits` esa semana. |

Umbrales propuestos para cambiar de idea (ajustables): contacto sobre usuarios < 15 %, contacto entre quienes dejaron datos < 40 %, intención concreta < 30 %.

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
