-- El correo del JWT se compara en minúsculas, igual que isAdmin() (lib/admin.ts).
-- Si se agrega otro admin a ADMIN_EMAILS, también hay que agregarlo aquí: si no, sus envíos con de_admin fallan.
drop policy "visitantes insertan" on public.signups;
create policy "visitantes insertan" on public.signups
  for insert to anon, authenticated
  with check (
    nombre_completo is not null
    and numero_documento is not null
    and autoriza_datos_at = now()
    -- solo la sesión del admin puede marcar un envío como suyo
    and (not de_admin or lower(auth.jwt() ->> 'email') = 'vibiana.salgado@gmail.com')
  );
