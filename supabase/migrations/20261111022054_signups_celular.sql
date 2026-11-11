-- Celular para contactar por WhatsApp o llamada (celular colombiano: 10 dígitos que empiezan por 3).
alter table public.signups
  add column celular text
  check (celular is null or celular ~ '^3[0-9]{9}$');

-- Si piden WhatsApp o llamada, el celular es obligatorio.
-- NOT VALID: aplica a los envíos nuevos; no revisa los que ya existen.
alter table public.signups
  add constraint signups_celular_si_whatsapp_o_llamada
  check (canal_contacto is null or canal_contacto = 'correo' or celular is not null) not valid;
