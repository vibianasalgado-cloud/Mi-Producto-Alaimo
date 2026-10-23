-- Las rutas /api/interes y /api/feedback insertan con la llave pública (la secreta es solo del panel admin),
-- así que el visitante anónimo necesita poder insertar. La migración cerrar_insert_publico quitó
-- estas políticas y los formularios de la landing quedaron fallando con error de RLS.
-- Los CHECK de las tablas siguen validando longitudes y formato de correo.
create policy "visitantes insertan" on public.signups
  for insert to anon, authenticated with check (true);
create policy "visitantes insertan" on public.feedback
  for insert to anon, authenticated with check (true);
