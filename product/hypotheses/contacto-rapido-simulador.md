# Hipótesis: contacto rápido desde el simulador

**Creemos que** los visitantes de la landing que usan el simulador de cuotas
**pedirán contacto** con más frecuencia si pueden hacerlo desde la tarjeta de resultado del simulador, con solo nombre, celular y canal (WhatsApp o llamada),
**porque** el formulario largo actual (nombres completos, tipo y número de documento, correo, autorización) frena a quien todavía está explorando y aún no quiere entregar su documento.

**Sabremos que se cumple si** al menos el **25 %** de los visitantes que simulan con el contacto rápido visible dejan sus datos de contacto, y esa tasa es al menos **1,5 veces la línea base** (visitantes que simulan con el formulario largo)
**dentro de** 2 semanas desde que se enciende el flag, con al menos 100 visitantes que simulan con el contacto rápido visible.

**Sabremos que falló si** la tasa queda por debajo del **10 %** o no supera la línea base. Eso diría que la fricción del formulario no era lo que frenaba el contacto.

## Línea base

- **Métrica:** "Simularon y dejaron sus datos" en `/admin/metricas` (producción): visitantes de `simulaciones` cuyo `visitor_id` aparece en un `signups` con simulación adjunta ÷ visitantes que simularon.
- **Valor actual:** _pendiente: leerlo en producción antes de encender el flag y anotarlo aquí._

## Experimento

1. **Exposición mínima:** formulario corto dentro de la tarjeta de resultado del simulador, detrás de un feature flag. Con el flag apagado la landing queda igual que hoy. Los niveles y a quién se muestra cada uno van en el plan de exposición.
2. **Instrumentación:** cada envío del formulario corto se guarda en `contactos_rapidos`, separado del formulario largo, con el `visitor_id` de la cookie `vid` y el monto y las cuotas simulados. El divisor se aproxima por horario: visitantes que simularon desde que se encendió el interruptor (más quienes enviaron el formulario corto, que exige simular). No se marca qué visitas vieron el formulario, así que una pestaña abierta antes de encender puede contar sin haberlo visto. La línea base usa los datos anteriores al primer encendido (`feature_flags.primera_encendida_at`).
3. **Regla de decisión** (fijada antes de encender):
   - **Avanzar** (siguiente nivel del plan): ≥ 25 % y ≥ 1,5 × la línea base.
   - **Iterar** (ajustar textos o campos y repetir 2 semanas): entre 10 % y 25 %, o por encima de la línea base pero sin llegar a 1,5 ×.
   - **Parar** (apagar el flag y mantener el formulario largo): < 10 % o sin mejora sobre la línea base.

## Riesgos y preguntas abiertas

- La política de insert y los CHECK de `signups` exigen nombre, documento y `autoriza_datos_at` (Ley 1581). El formulario corto debe conservar la autorización de datos y guardarse sin documento, lo que pide cambiar la regla o usar otra tabla. Se decide al construir el nivel 1.
- Con poco tráfico, 100 visitantes que simulan puede tardar más de 2 semanas. Si pasa, se extiende el plazo; no se cambia el umbral.
