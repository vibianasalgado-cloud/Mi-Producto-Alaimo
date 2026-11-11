-- Canal preferido para contactar desde el formulario de la landing (opcional).
-- Los envíos existentes quedan en null; la política de insert no cambia.
alter table public.signups
  add column canal_contacto text
  check (canal_contacto is null or canal_contacto in ('whatsapp', 'llamada', 'correo'));
