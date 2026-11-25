# Plan de exposición: contacto rápido desde el simulador

**Hipótesis** ([contacto-rapido-simulador.md](../hypotheses/contacto-rapido-simulador.md)): los visitantes que usan el simulador de cuotas pedirán contacto con más frecuencia si pueden hacerlo desde la tarjeta de resultado, con solo nombre, celular y canal, porque el formulario largo frena a quien todavía está explorando.

## Nivel 1 — Contacto rápido en el resultado del simulador

- **Qué se revela:** debajo de la cuota estimada, un formulario corto con nombre, celular, canal (WhatsApp o llamada) y la autorización de tratamiento de datos; el monto y las cuotas simulados se adjuntan solos. Al enviar, un mensaje de confirmación. Sigue oculto: cualquier pedido de documento o correo después del envío y cualquier promesa de tiempo de respuesta. El formulario largo del final de la página no cambia.
- **Creencia:** quienes simulan piden contacto cuando no se les exige documento ni correo.
- **Audiencia:** visitantes de la landing que interactúan con el simulador.
- **Duración:** 2 semanas, o hasta juntar 100 visitantes que simulan con el contacto rápido visible.
- **Validación:** **Avanzar si** ≥ 25 % de quienes simulan dejan sus datos y eso es ≥ 1,5 × la línea base (formulario largo). **Parar si** < 10 % o no supera la línea base.

## Nivel 2 — Completar datos después del contacto

- **Qué se revela:** todo lo del nivel 1, más una pantalla tras el envío que invita, de forma opcional, a completar tipo y número de documento y correo "para agilizar tu crédito". Sigue oculto: el contacto directo por WhatsApp.
- **Creencia:** quien pidió contacto rápido está dispuesto a entregar su documento una vez que ya dio el primer paso, así que el contacto rápido trae interesados reales y no solo curiosos.
- **Audiencia:** visitantes que enviaron el formulario corto del nivel 1.
- **Duración:** 2 semanas.
- **Validación:** **Avanzar si** ≥ 40 % de quienes envían el formulario corto completan documento y correo. **Parar si** < 20 %: el contacto rápido trae curiosidad, no intención de crédito.

## Nivel 3 — Conversación inmediata por WhatsApp

- **Qué se revela:** todo lo anterior, más, para quien eligió WhatsApp, un botón "Escríbenos ahora" que abre el chat con un mensaje prellenado con su simulación (el asesor se simula en el prototipo).
- **Creencia:** quien pide contacto por WhatsApp prefiere iniciar la conversación de inmediato antes que esperar a que lo llamen.
- **Audiencia:** visitantes que enviaron el formulario corto y eligieron WhatsApp.
- **Duración:** 2 semanas.
- **Validación:** **Avanzar si** ≥ 30 % de quienes eligen WhatsApp tocan "Escríbenos ahora". **Parar si** < 10 %: prefieren que los contacten y el botón sobra.

## Mecanismo de revelación

**Feature flags**, como se pidió. Encaja bien: cada nivel es una capa visible que se enciende y se apaga sin redesplegar, y los niveles 2 y 3 se muestran a subgrupos definidos por comportamiento (quien envió el formulario corto, quien eligió WhatsApp), algo que el desarrollo incremental no puede hacer. Un flag por nivel; apagar el del nivel 1 deja la landing como hoy.

## Validaciones en paralelo

- **Legal (Ley 1581):** el formulario corto guarda datos personales sin documento. Legal debe aprobar el texto de autorización (hoy marcado `REVISAR`) antes de encender el nivel 1 en producción.
- **Capacidad de contacto:** si el nivel 1 funciona, llegan más solicitudes. Hay que confirmar quién las atiende y en cuánto tiempo, aunque el contacto se simule en el prototipo.
- **Calidad del dato:** `signups` exige documento hoy; guardar el contacto rápido pide cambiar esa regla o usar otra tabla, sin perder el vínculo por `visitor_id` con `simulaciones`.

## Preguntas abiertas para el equipo de producto

- ¿Cuál es hoy la línea base de "Simularon y dejaron sus datos" en producción?
- ¿Cuántos visitantes simulan por semana? Si son pocos, 100 visitantes puede tardar más de 2 semanas.
- ¿Los envíos del formulario corto se mezclan en el panel admin con los del largo o se muestran aparte?
