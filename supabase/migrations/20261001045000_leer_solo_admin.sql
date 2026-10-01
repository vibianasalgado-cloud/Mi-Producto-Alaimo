drop policy "autenticados leen" on public.signups;
drop policy "autenticados leen" on public.feedback;

-- Solo el admin (por correo) puede leer
create policy "solo admin lee" on public.signups
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'vibiana.salgado@gmail.com');
create policy "solo admin lee" on public.feedback
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'vibiana.salgado@gmail.com');
