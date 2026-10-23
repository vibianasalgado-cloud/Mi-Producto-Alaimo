-- Datos del cliente en el formulario de interés de la landing.
-- Las políticas de signups no cambian: cualquiera inserta y solo el admin (por correo) lee.

-- 1) Cada envío es una fila: la misma persona puede volver y dejar otra simulación.
alter table public.signups drop constraint signups_email_key;
create index signups_email_idx on public.signups (email);

-- 2) Nombre y documento. Las filas anteriores quedan sin estos datos; los nuevos envíos los traen todos.
alter table public.signups
  add column nombre_completo text check (nombre_completo is null or length(nombre_completo) between 3 and 120),
  add column tipo_documento text check (tipo_documento in ('CC', 'CE', 'PPT', 'PA')),
  add column numero_documento text,
  -- Autorización de tratamiento de datos (Ley 1581 de 2012): cuándo la aceptó
  add column autoriza_datos_at timestamptz,
  -- Visitante anónimo (cookie vid) para unir el envío con sus visitas y simulaciones
  add column visitor_id uuid,
  add constraint signups_documento_valido check (
    numero_documento is null
    or (tipo_documento in ('CC', 'PPT') and numero_documento ~ '^[0-9]{5,10}$')
    or (tipo_documento in ('CE', 'PA') and numero_documento ~ '^[A-Za-z0-9]{5,12}$')
  ),
  add constraint signups_datos_completos check (
    (nombre_completo is null) = (tipo_documento is null)
    and (tipo_documento is null) = (numero_documento is null)
  ),
  add constraint signups_documento_autorizado check (numero_documento is null or autoriza_datos_at is not null);

create index signups_visitor_id_idx on public.signups (visitor_id);
