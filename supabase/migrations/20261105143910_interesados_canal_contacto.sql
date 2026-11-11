-- Canal preferido para contactar (opcional). Los registros existentes quedan en null.
alter table public.interesados
  add column canal_contacto text
  check (canal_contacto is null or canal_contacto in ('whatsapp', 'llamada', 'correo'));
