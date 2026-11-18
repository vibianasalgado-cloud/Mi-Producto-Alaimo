[credito en comercios]: [pretende ensenar a los clientes como usar el producto, para que sirve, en que comercios] para [clientes nequi que necesiten una opcion de financiacion].

## Reacción

Entendió: [Lo que entendieron los clientes de la landing es que es un credito para usarse en comercios, que efectivamente se usa en comercios y puede ser usado en comercios digitales y en fisicos a traves de datafonos de redeban].

No entendió: [no entendio como se paga exactamente en el comercio, es decir el paso a paso ni las formas de pago una vez el credito este en uso, ni si el dinero va directamente al comercio o llega a la cuenta del cliente y el cliente le paga al comercio].

## Cómo levantar el proyecto

Si eres nuevo, lee primero el [mapa del producto](docs/mapa-del-producto.md): qué hace la app, sus partes, el flujo del usuario y dónde tocar.

Necesitas Git y Node.js (se probó con Node 24). No hace falta instalar nada más.

1. **Clona el repositorio** en una carpeta vacía y entra en ella:

   ```bash
   git clone https://github.com/vibianasalgado-cloud/Mi-Producto-Alaimo.git .
   ```

2. **Instala las dependencias** con las versiones exactas del `package-lock.json`:

   ```bash
   npm ci
   ```

   En Windows PowerShell, si sale "running scripts is disabled on this system", usa `npm.cmd ci` (y `npm.cmd` en los demás comandos).

3. **Crea tu `.env.local`** copiando `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

   En PowerShell: `Copy-Item .env.example .env.local`.

4. **Pide los valores** de cada variable al dueño del proyecto y pégalos en `.env.local`. Tienen que ser los de la base de **desarrollo** (`sup-mi-producto-dev`), nunca los de producción. `.env.local` no se sube a git; `.env.example` sí, y nunca lleva valores.

5. **Levanta la app:**

   ```bash
   npm run dev
   ```

   Abre http://localhost:3000. Deberías ver la landing "Crédito en comercios". Si la terminal muestra `Environments: .env.local`, leyó tus variables.

6. **Para entrar al panel admin** (`/admin`), tu correo tiene que estar en `ADMIN_EMAILS` y tienes que crear tu cuenta en `/registro`. Todo lo que hagas en local (cuentas, registros, formularios) queda guardado en la base de desarrollo.

Antes de subir un cambio, revisa que compile con `npm run build` o `npx tsc --noEmit`. No hay tests. Las reglas de trabajo (ramas, pull requests, migraciones) están en [CLAUDE.md](CLAUDE.md).
