-- La llave publicable es pública por diseño: la base no confía en lo que mande quien inserta.
-- 1) La fecha de autorización la pone la base, no el que envía.
alter table public.signups alter column autoriza_datos_at set default now();

-- 2) Envíos hechos con la sesión del admin (pruebas): se guardan, pero las métricas los excluyen.
alter table public.signups add column de_admin boolean not null default false;

-- 3) Las filas nuevas traen nombre, documento y autorización del momento del envío.
--    Las 6 filas anteriores a estos campos no se tocan (la política solo aplica a inserts nuevos).
drop policy "visitantes insertan" on public.signups;
create policy "visitantes insertan" on public.signups
  for insert to anon, authenticated
  with check (
    nombre_completo is not null
    and numero_documento is not null
    and autoriza_datos_at = now()
    -- solo la sesión del admin puede marcar un envío como suyo
    and (not de_admin or (auth.jwt() ->> 'email') = 'vibiana.salgado@gmail.com')
  );
