# Mapa del producto: Crédito en comercios

Guía para quien llega nuevo al proyecto. Cada afirmación lleva el archivo (y la línea, cuando ayuda) donde se puede comprobar. Lo marcado **sin confirmar** no se puede verificar leyendo el código del repositorio: depende de la configuración de Supabase o Vercel, o de algo que el código no muestra.

Las rutas de los enlaces son relativas a esta carpeta (`docs/`).

---

## 1. Qué hace la app

**Es un prototipo para validar una hipótesis de producto:** ¿las personas que conocen el "Crédito en comercios" de Nequi quieren que las contacten para obtenerlo? ([CLAUDE.md](../CLAUDE.md), sección "La app").

- **Una página pública que enseña el producto.** Explica dónde se usa (datáfono Redeban y tiendas online), que Nequi le paga al comercio y no al cliente, cómo se compra, cómo se paga, en qué marcas sirve y las preguntas frecuentes ([app/_landing/body.html](../app/_landing/body.html): secciones `#donde-usar` l. 77, `#tu-dinero` l. 109, `#como-funciona` l. 166, `#forma-de-pago` l. 244, `#comercios` l. 287, `#preguntas` l. 317).
- **Un simulador de cuotas.** La persona elige un monto y un número de cuotas y ve la cuota mensual. La tasa es de ejemplo (2 % mensual), no la real ([app/LandingScripts.tsx:55-61](../app/LandingScripts.tsx); controles en [body.html:389-406](../app/_landing/body.html)).
- **Un formulario "quiero que me contacten".** Pide nombre, documento, correo, canal preferido (WhatsApp, llamada o correo), celular si elige WhatsApp o llamada, y la autorización de tratamiento de datos. Puede llevar adjunta la simulación ([body.html:431-475](../app/_landing/body.html), [app/api/interes/route.ts](../app/api/interes/route.ts)).
- **Un formulario corto de contacto en el simulador (experimento, detrás de un interruptor).** Con el interruptor `contacto_rapido_simulador` encendido, la tarjeta del simulador pide solo nombre, canal (WhatsApp o llamada), celular y autorización, y adjunta la simulación; el botón que bajaba al formulario largo queda como enlace secundario. Apagado, la landing es la de siempre ([app/page.tsx](../app/page.tsx), [app/_landing/contacto-rapido.html](../app/_landing/contacto-rapido.html), [app/api/contacto-rapido/route.ts](../app/api/contacto-rapido/route.ts)). Ver la sección 5.
- **Un formulario de comentarios sobre la página** ([body.html:366-376](../app/_landing/body.html), [app/api/feedback/route.ts](../app/api/feedback/route.ts)).
- **Cuentas de usuario.** Quien crea una cuenta puede dejar uno o varios registros de "qué financiación busco" y editarlos ([app/mi-cuenta/page.tsx](../app/mi-cuenta/page.tsx)).
- **Un panel para el equipo (admin).** Muestra todo lo que dejó la gente, permite descargar CSV y tiene un tablero de métricas para decidir si la hipótesis se sostiene ([app/admin/page.tsx](../app/admin/page.tsx), [app/admin/metricas/page.tsx](../app/admin/metricas/page.tsx)).
- **Reacción de los primeros clientes:** entendieron que es un crédito para usar en comercios, pero no el paso a paso del pago ni a quién le llega el dinero ([README.md](../README.md)).

Lo que el código **no** hace: no otorga créditos, no cobra y no contacta a nadie. Solo registra el interés.

---

## 2. Componentes

### Páginas (lo que ve la gente)

| Ruta | Qué es | Archivo |
|---|---|---|
| `/` | La landing pública. Inserta el HTML original y le suma los scripts. Lee el interruptor en cada visita y, si está encendido, agrega el formulario corto | [app/page.tsx](../app/page.tsx) → [app/_landing/body.html](../app/_landing/body.html) (+ [contacto-rapido.html](../app/_landing/contacto-rapido.html)) + [app/LandingScripts.tsx](../app/LandingScripts.tsx) |
| `/registro` | Crear cuenta con correo y contraseña | [app/registro/page.tsx](../app/registro/page.tsx) → [app/AuthForm.tsx](../app/AuthForm.tsx) |
| `/login` | Entrar | [app/login/page.tsx](../app/login/page.tsx) → [app/AuthForm.tsx](../app/AuthForm.tsx) |
| `/mi-cuenta` | Formulario y lista de los registros propios, con opción de editarlos | [app/mi-cuenta/page.tsx](../app/mi-cuenta/page.tsx) |
| `/mis-comentarios` | Comentarios propios del usuario con sesión. Ninguna página enlaza a esta ruta; solo aparece en el `matcher` de [proxy.ts:43](../proxy.ts) | [app/mis-comentarios/page.tsx](../app/mis-comentarios/page.tsx) |
| `/admin` | Interruptores (encender y apagar features), contactos rápidos, tablas de signups (agrupados por correo), interesados y feedback, más el botón "Descargar CSV" | [app/admin/page.tsx](../app/admin/page.tsx) (componente `Interruptores`) |
| `/admin/metricas` | Tablero de métricas: interés y contacto, landing, simulador, experimento "contacto rápido" y gráfico por semana | [app/admin/metricas/page.tsx](../app/admin/metricas/page.tsx) |

Piezas compartidas:

- [app/layout.tsx](../app/layout.tsx): título, fuente Manrope y el tema claro u oscuro guardado en `localStorage` (l. 8-14).
- [app/LogoutButton.tsx](../app/LogoutButton.tsx): botón "Cerrar sesión".
- [app/RegistrarVisita.tsx](../app/RegistrarVisita.tsx): componente invisible que avisa "este usuario entró hoy".
- Estilos: [app/landing.css](../app/landing.css) para la landing y [app/auth.css](../app/auth.css) para cuenta y admin.

### Rutas de API (el servidor; el navegador nunca habla con la base)

| Ruta | Quién la usa | Qué hace | Archivo |
|---|---|---|---|
| `POST /api/auth/registro` | `/registro` | Valida correo y contraseña (6-72 caracteres) y crea la cuenta en Supabase Auth | [route.ts](../app/api/auth/registro/route.ts) |
| `POST /api/auth/login` | `/login` | Inicia sesión y dice si es admin | [route.ts](../app/api/auth/login/route.ts) |
| `POST /api/auth/logout` | Botón "Cerrar sesión" | Cierra la sesión | [route.ts](../app/api/auth/logout/route.ts) |
| `GET/POST/PATCH /api/interesados` | `/mi-cuenta` | Lista, crea y edita los registros propios. Exige sesión | [route.ts](../app/api/interesados/route.ts) |
| `GET/POST /api/mis-comentarios` | `/mis-comentarios` | Lista y crea comentarios propios. Exige sesión | [route.ts](../app/api/mis-comentarios/route.ts) |
| `POST /api/visitas` | `RegistrarVisita` | Una fila por usuario y día en `visits` | [route.ts](../app/api/visitas/route.ts) |
| `POST /api/interes` | Formulario de la landing | Valida y guarda en `signups`. Es pública | [route.ts](../app/api/interes/route.ts) |
| `POST /api/feedback` | Comentarios de la landing | Guarda en `feedback`. Es pública | [route.ts](../app/api/feedback/route.ts) |
| `POST /api/visitas-landing` | Al abrir la landing ([LandingScripts.tsx:78](../app/LandingScripts.tsx)) | Una fila por visitante anónimo y día en `landing_visits` | [route.ts](../app/api/visitas-landing/route.ts) |
| `POST /api/simulaciones` | Primer uso del simulador ([LandingScripts.tsx:134](../app/LandingScripts.tsx)) | Una fila por visitante y día en `simulaciones` | [route.ts](../app/api/simulaciones/route.ts) |
| `POST /api/contacto-rapido` | Formulario corto del simulador | Valida y guarda en `contactos_rapidos`. Pública, pero responde 404 con el interruptor apagado | [route.ts](../app/api/contacto-rapido/route.ts) |
| `GET /api/admin/datos` | `/admin` | Lee `signups`, `feedback`, `interesados` y `contactos_rapidos` con la llave secreta. Solo admin | [route.ts](../app/api/admin/datos/route.ts) |
| `GET/PATCH /api/admin/flags` | `/admin` (Interruptores) | Lista los interruptores y enciende o apaga uno; al encender guarda `encendida_at`. Llave secreta. Solo admin | [route.ts](../app/api/admin/flags/route.ts) |
| `GET /api/admin/metricas` | `/admin/metricas` | Calcula las métricas con la llave secreta. Solo admin | [route.ts](../app/api/admin/metricas/route.ts) |

### Librerías y seguridad

- [lib/supabase/server.ts](../lib/supabase/server.ts): cliente con llave pública y la sesión de las cookies, para que la base aplique el RLS.
- [lib/supabase/admin.ts](../lib/supabase/admin.ts): cliente con llave secreta, que salta el RLS. Lleva `server-only` y solo lo importan las rutas de `app/api/admin/`.
- [lib/admin.ts](../lib/admin.ts): `isAdmin()` compara el correo, sin distinguir mayúsculas, con `ADMIN_EMAILS`.
- [lib/visitante.ts](../lib/visitante.ts): cookie anónima `vid` (un UUID que dura un año); excluye bots y al admin.
- [lib/validar.ts](../lib/validar.ts): formato de correo.
- [lib/flags.ts](../lib/flags.ts): `featureEncendida(clave)` pregunta a la base si un interruptor está encendido (con la llave pública, vía la función `feature_encendida`); ante un error responde "apagado".
- [proxy.ts](../proxy.ts): antes de abrir `/mi-cuenta`, `/mis-comentarios` y `/admin`, refresca la sesión. Sin sesión manda a `/login?next=…` (l. 28-33); si no es admin, de `/admin` manda a `/mi-cuenta` (l. 34-39). Las API vuelven a comprobar por su cuenta, por ejemplo [app/api/admin/datos/route.ts:9-10](../app/api/admin/datos/route.ts).

### Base de datos (Supabase, carpeta [supabase/migrations/](../supabase/migrations/))

| Tabla | Qué guarda | Quién escribe / quién lee | Migración |
|---|---|---|---|
| `interesados` | Registros de "qué financiación busco" de cada usuario | Cada usuario solo lo suyo; el admin lee todo | [20261008143342_interesados.sql](../supabase/migrations/20261008143342_interesados.sql), canal en [20261105143910](../supabase/migrations/20261105143910_interesados_canal_contacto.sql) |
| `signups` | Envíos del formulario de la landing (nombre, documento, correo, canal, celular, simulación) | Cualquiera inserta, con reglas; solo el admin lee | [20261001032432](../supabase/migrations/20261001032432_signups_feedback.sql) y siguientes, sobre todo [20261022144244_signups_insert_estricto.sql](../supabase/migrations/20261022144244_signups_insert_estricto.sql) |
| `feedback` | Comentarios de la landing | Cualquiera inserta; solo el admin lee | [20261001032432](../supabase/migrations/20261001032432_signups_feedback.sql), [20261001041706](../supabase/migrations/20261001041706_leer_solo_admin.sql) |
| `mis_comentarios` | Comentarios de usuarios con sesión | Cada usuario solo lo suyo; el admin lee todo según la política, pero `/admin` no lo muestra ([datos/route.ts:14](../app/api/admin/datos/route.ts)) | [20261015025121_mis_comentarios.sql](../supabase/migrations/20261015025121_mis_comentarios.sql) |
| `visits` | Un día de uso por usuario (hora de Bogotá) | Cada usuario lo suyo; el admin lee todo | [20261015142201_visits.sql](../supabase/migrations/20261015142201_visits.sql) |
| `landing_visits` | Un día de visita por visitante anónimo | Cualquiera inserta solo el día de hoy; solo el admin lee | [20261015144419_landing_visits.sql](../supabase/migrations/20261015144419_landing_visits.sql) |
| `simulaciones` | Un día de uso del simulador por visitante (sin montos) | Cualquiera inserta solo el día de hoy; solo el admin lee | [20261022141947_simulador.sql](../supabase/migrations/20261022141947_simulador.sql) |
| `feature_flags` | Interruptores de features: `clave`, `encendida` (apagada por defecto), `encendida_at` (última vez que se encendió), `primera_encendida_at` (primera vez; ahí termina la línea base) y `actualizada_at`. Hoy tiene una fila: `contacto_rapido_simulador` | RLS sin políticas: con la llave pública nadie la lee ni la cambia; solo las rutas de `/api/admin` con la llave secreta. La landing solo puede preguntar "¿está encendida?" con la función `feature_encendida(clave)` | [20261119144738_interruptores_contacto_rapido.sql](../supabase/migrations/20261119144738_interruptores_contacto_rapido.sql) |
| `contactos_rapidos` | Envíos del formulario corto del simulador: nombre, canal, celular, simulación, `visitor_id`, autorización y `de_admin` (sin documento ni correo) | Cualquiera inserta solo con el interruptor encendido; solo el admin lee | [20261119144738_interruptores_contacto_rapido.sql](../supabase/migrations/20261119144738_interruptores_contacto_rapido.sql) |

Las políticas "admin lee" comparan con un correo fijo escrito en cada migración (por ejemplo [20261008143342_interesados.sql:27-30](../supabase/migrations/20261008143342_interesados.sql)), además de `ADMIN_EMAILS`.

**Sin confirmar:** que todas estas migraciones estén aplicadas en las bases de desarrollo y producción. Eso se ve en Supabase (`list_migrations`), no en el código.

### Despliegue y herramientas

- [vercel.json](../vercel.json): compila y, solo en producción, aplica las migraciones con `supabase db push`.
- [package.json](../package.json): Next 16, React 19, `@supabase/ssr`, `@supabase/supabase-js` y la CLI de Supabase. No hay tests ni linter.
- [.claude/launch.json](../.claude/launch.json): servidor `next-dev` (puerto 3000) y servidores estáticos de versiones alternativas de la landing que sirve [server.ps1](../server.ps1).
- [.claude/agents/](../.claude/agents/): revisores de solo lectura de seguridad, QA y mobile.
- [.claude/skills/nueva-entidad/SKILL.md](../.claude/skills/nueva-entidad/SKILL.md): receta para agregar una tabla por usuario.

---

## 3. Flujo de usuario: del registro al primer registro guardado

1. **Llega a crear su cuenta.** Desde la landing hay un enlace "¿Quieres guardar tus datos y volver a verlos? Crea tu cuenta" que lleva a `/registro` ([body.html:479](../app/_landing/body.html)). También se llega desde `/login` con "¿No tienes cuenta? Crear una" ([AuthForm.tsx:72-74](../app/AuthForm.tsx)).
2. **Escribe correo y contraseña.** El navegador exige los dos campos y una contraseña de al menos 6 caracteres ([AuthForm.tsx:51-68](../app/AuthForm.tsx)). Al pulsar "Crear cuenta" se envía `POST /api/auth/registro` ([AuthForm.tsx:25-29](../app/AuthForm.tsx)) y el botón queda deshabilitado mientras tanto (l. 69).
3. **El servidor crea la cuenta.** Valida el formato del correo y una contraseña de 6 a 72 caracteres ([registro/route.ts:9-11](../app/api/auth/registro/route.ts)), y llama a `supabase.auth.signUp` (l. 14). Si Supabase rechaza el registro, por ejemplo porque el correo ya existe, devuelve "No se pudo crear la cuenta: " más el mensaje de Supabase tal cual, en inglés (l. 15).
4. **Queda con la sesión abierta.** Si Supabase devuelve una sesión, esta se guarda en cookies desde el servidor ([lib/supabase/server.ts:13-16](../lib/supabase/server.ts)). Si no la devuelve, la pantalla muestra "Revisa tu correo para confirmar la cuenta" ([registro/route.ts:16](../app/api/auth/registro/route.ts), [AuthForm.tsx:33-34](../app/AuthForm.tsx)). **Sin confirmar:** qué caso ocurre depende de la opción "Confirm email" de Supabase Auth, que no está en el código ([CLAUDE.md](../CLAUDE.md) dice que está desactivada).
5. **Lo lleva a "Mi cuenta".** El navegador hace una navegación completa a `/mi-cuenta`, o a la ruta interna que venga en `?next=` ([AuthForm.tsx:7-11, 36-37](../app/AuthForm.tsx)). Al registrarse siempre va a `/mi-cuenta` aunque sea admin, porque la respuesta de registro no trae `admin`; en cambio, la de login sí ([login/route.ts:14](../app/api/auth/login/route.ts)).
6. **El proxy deja pasar.** `proxy.ts` comprueba la sesión antes de mostrar `/mi-cuenta` ([proxy.ts:24-33](../proxy.ts)).
7. **Se anota la visita del día.** `RegistrarVisita` llama a `POST /api/visitas` ([mi-cuenta/page.tsx:116](../app/mi-cuenta/page.tsx), [RegistrarVisita.tsx:7-9](../app/RegistrarVisita.tsx)), que inserta una fila en `visits` solo si no hay otra del mismo día ([visitas/route.ts:9](../app/api/visitas/route.ts)). El día se calcula en hora de Bogotá ([20261015142201_visits.sql:4](../supabase/migrations/20261015142201_visits.sql)). Esto alimenta la métrica de retorno.
8. **Carga sus registros, que todavía no hay.** La página pide `GET /api/interesados` ([mi-cuenta/page.tsx:36-43](../app/mi-cuenta/page.tsx)). La API comprueba la sesión y lee la tabla con el RLS aplicado, así que solo vienen las filas propias ([interesados/route.ts:41-47](../app/api/interesados/route.ts)). Se muestran el correo arriba y "Todavía no tienes registros." ([mi-cuenta/page.tsx:120, 196-200](../app/mi-cuenta/page.tsx)).
9. **Llena el formulario** ([mi-cuenta/page.tsx:125-174](../app/mi-cuenta/page.tsx)):
   - **"¿Qué ofrecimiento de financiación en comercios te interesa?"**: obligatorio, máximo 500 caracteres.
   - **"¿Cómo te gustaría hacerlo?"** y **"¿Dónde te gustaría comprar?"**: opcionales.
   - **"¿Cómo prefieres que te contactemos?"**: WhatsApp, llamada, correo o sin preferencia. Solo se activa si está marcada la casilla de contacto.
   - **"Quiero ser contactado para obtener un crédito"**: viene marcada por defecto (l. 29).
10. **Pulsa "Guardar".** El navegador revisa que el ofrecimiento no esté vacío (l. 83), bloquea un segundo envío (l. 33, 82-85) y manda `POST /api/interesados` con los campos (l. 88-99).
11. **El servidor valida y guarda** ([interesados/route.ts:49-58](../app/api/interesados/route.ts)):
    - Exige sesión (l. 51).
    - Valida igual que la tabla: ofrecimiento obligatorio, máximo 500 caracteres y canal dentro de la lista (l. 16-28).
    - Si no quiere contacto, guarda el canal vacío (l. 30-37).
    - Inserta sin enviar `user_id` ni `email`, que pone la base con `auth.uid()` y el correo del JWT ([20261008143342_interesados.sql:3-4](../supabase/migrations/20261008143342_interesados.sql)).
    - La política "usuario inserta lo suyo" impide guardar a nombre de otro (l. 17-18 de esa migración).
12. **Confirmación.** El formulario se limpia y muestra "¡Listo, gracias!", y la lista se recarga con el registro nuevo ([mi-cuenta/page.tsx:102-105](../app/mi-cuenta/page.tsx)). Desde ahí puede editarlo con "Editar", que envía `PATCH` ([mi-cuenta/page.tsx:58-68, 89](../app/mi-cuenta/page.tsx); [interesados/route.ts:61-76](../app/api/interesados/route.ts)). No hay opción para borrar en la interfaz ni en la API, aunque la política de borrado existe en la base.
13. **Lo que ve el equipo.** El registro aparece en `/admin`, en la tabla "Interesados" ([admin/page.tsx:200](../app/admin/page.tsx), vía [admin/datos/route.ts:14](../app/api/admin/datos/route.ts)), y cuenta para la activación y para "quieren ser contactados" en `/admin/metricas` ([admin/metricas/route.ts:52-56](../app/api/admin/metricas/route.ts)).

---

## 4. Dónde tocar: los tres cambios más probables

Hay pocas pruebas automáticas: después de cualquier cambio, corre `npm run build` o `npx tsc --noEmit` ([CLAUDE.md](../CLAUDE.md), "Comandos") y revisa en `http://localhost:3000`.

### A. Cambiar textos o contenido de la landing

Es probable porque el [README.md](../README.md) dice que los clientes no entendieron el paso a paso del pago, y el HTML tiene 9 marcas `REVISAR` pendientes de Legal o Producto.

| Qué | Archivo |
|---|---|
| Textos, secciones, preguntas frecuentes, marcas de comercios | [app/_landing/body.html](../app/_landing/body.html) |
| Estilos de la landing (no mezclar con `auth.css`) | [app/landing.css](../app/landing.css) |
| Logos de comercios | [public/logos/](../public/logos/) |
| Tasa, montos y fórmula del simulador | [app/LandingScripts.tsx:55-61](../app/LandingScripts.tsx), el deslizador en [body.html:396](../app/_landing/body.html) y, si cambian los límites, los CHECK de `signups` (nueva migración) y la validación en [app/api/interes/route.ts:61-67](../app/api/interes/route.ts) |
| Título y descripción de la pestaña | [app/layout.tsx:3-6](../app/layout.tsx) |

### B. Pedir un dato nuevo en el formulario de contacto de la landing (`signups`)

Es probable porque es lo que se ha hecho en los últimos cambios: canal y celular ([20261111021040](../supabase/migrations/20261111021040_signups_canal_contacto.sql), [20261111022054](../supabase/migrations/20261111022054_signups_celular.sql)).

| Qué | Archivo |
|---|---|
| Columna nueva con su CHECK, en una migración nueva (no editar las ya aplicadas) | `supabase/migrations/<fecha>_<nombre>.sql` |
| Campo en el formulario | [app/_landing/body.html:431-475](../app/_landing/body.html) |
| Leer el campo y enviarlo | [app/LandingScripts.tsx:269-307](../app/LandingScripts.tsx) |
| Validar igual que el CHECK y guardar | [app/api/interes/route.ts](../app/api/interes/route.ts) (validaciones l. 21-67, insert l. 73-85) |
| Mostrarlo en la tabla de signups y en el CSV | [app/admin/page.tsx](../app/admin/page.tsx) (tipo `Signup` l. 10, `descargarCsv` desde l. 42, tabla desde l. 140) |
| Si debe entrar en una métrica | [app/api/admin/metricas/route.ts](../app/api/admin/metricas/route.ts) y [app/admin/metricas/page.tsx](../app/admin/metricas/page.tsx) |
| Documentarlo | [CLAUDE.md](../CLAUDE.md) |

### C. Pedir un dato nuevo en el registro de "Mi cuenta" (`interesados`)

Es probable porque es la entidad principal del producto, y ya se le agregó el canal de contacto ([20261105143910](../supabase/migrations/20261105143910_interesados_canal_contacto.sql)).

| Qué | Archivo |
|---|---|
| Columna nueva con su CHECK, en una migración nueva | `supabase/migrations/<fecha>_<nombre>.sql` |
| Validar y guardar al crear y al editar | [app/api/interesados/route.ts](../app/api/interesados/route.ts) (`leerRegistro`, l. 16-39) |
| Campo del formulario, estado, edición y columna de "Mis registros" | [app/mi-cuenta/page.tsx](../app/mi-cuenta/page.tsx) (tipo `Fila` l. 8-16, estados l. 25-29, `limpiar` y `editar` l. 49-68, cuerpo del envío l. 91-98, formulario l. 125-174, tabla l. 183-225) |
| Mostrarlo al admin | [app/admin/page.tsx](../app/admin/page.tsx) (sección "Interesados", desde l. 198) |
| Si cambia una métrica, por ejemplo "intención concreta" | [app/api/admin/metricas/route.ts](../app/api/admin/metricas/route.ts) (columnas leídas l. 53-56) y la tabla de métricas de [CLAUDE.md](../CLAUDE.md) |

Si en vez de un dato se quiere una **tabla nueva por usuario**, la receta está en [.claude/skills/nueva-entidad/SKILL.md](../.claude/skills/nueva-entidad/SKILL.md). Esa receta cita como modelo `supabase/migrations/20261008120000_interesados.sql`, pero el archivo real se llama [20261008143342_interesados.sql](../supabase/migrations/20261008143342_interesados.sql).

---

## 5. Experimentos e interruptores

Las features nuevas se prueban como experimentos: una hipótesis con un número que la valida o la descarta, un plan de exposición por niveles y un interruptor para encender cada nivel sin redesplegar.

### Dónde están la hipótesis y el plan

- **Hipótesis:** [product/hypotheses/contacto-rapido-simulador.md](../product/hypotheses/contacto-rapido-simulador.md). Quienes simulan piden más contacto si pueden hacerlo desde el simulador con solo nombre, celular y canal. Se cumple con ≥ 25 % y ≥ 1,5 × la línea base; falla con < 10 % o sin superar la línea base.
- **Plan de exposición:** [product/exposure-plans/2026-11-19-0937-contacto-rapido-simulador.md](../product/exposure-plans/2026-11-19-0937-contacto-rapido-simulador.md). Tres niveles; hoy solo está construido el **nivel 1** (formulario corto).

### Cómo funciona el interruptor

1. La fila `contacto_rapido_simulador` de `feature_flags` nace apagada ([migración](../supabase/migrations/20261119144738_interruptores_contacto_rapido.sql)).
2. El admin la enciende o apaga en `/admin`, sección "Interruptores" ([app/admin/page.tsx](../app/admin/page.tsx) → [app/api/admin/flags/route.ts](../app/api/admin/flags/route.ts)). Al encender se guarda `encendida_at` (y `primera_encendida_at` la primera vez). Pulsar dos veces o desde una pestaña desactualizada no cambia las fechas: solo cuenta un cambio real de estado.
3. En cada visita, [app/page.tsx](../app/page.tsx) pregunta con [lib/flags.ts](../lib/flags.ts) si está encendida (la página no se guarda en caché: `connection()`). Si la base tarda más de 1,5 s o falla, se toma como apagada. Si lo está, cambia el marcador `<!-- contacto-rapido -->` de [body.html](../app/_landing/body.html) por [contacto-rapido.html](../app/_landing/contacto-rapido.html) y el botón del simulador por un enlace al formulario largo. Al cambiar el interruptor, la landing cambia al refrescar.
4. Apagado, la ruta [`/api/contacto-rapido`](../app/api/contacto-rapido/route.ts) responde 404 y la política de insert de `contactos_rapidos` rechaza filas: hay dos defensas.

### La señal en `/admin/metricas`

Sección "Experimento: contacto rápido desde el simulador", calculada en [app/api/admin/metricas/route.ts](../app/api/admin/metricas/route.ts) (bloque `experimento`):

- **Ventana:** desde `encendida_at` hasta ahora; si está apagado, hasta que se apagó (`actualizada_at`). Si se vuelve a encender, cuenta desde el nuevo encendido.
- **Señal:** visitantes que simularon en la ventana (`simulaciones.created_at`, más quienes enviaron el formulario corto) y dejaron sus datos en la ventana con el mismo `visitor_id`, por el formulario corto o el largo con simulación. Muestra cuántos por cada formulario. No cuenta envíos del admin. El divisor es una aproximación por horario: no se marca qué visitas vieron el formulario corto.
- **Línea base:** la misma tasa antes del **primer** encendido, solo con el formulario largo.
- **Decisión:** aplica la regla de la hipótesis (avanzar, iterar o parar) solo con al menos 100 visitantes en la ventana y con línea base; antes muestra "Muestra insuficiente" o "Sin línea base" y lo que diría la regla con los datos de hoy. También muestra los días que lleva encendido (de 14).
- La tarjeta general "Simularon y dejaron sus datos" sigue contando solo el formulario largo; con el experimento encendido lo avisa.
- `/admin` permite descargar los contactos rápidos en CSV.
