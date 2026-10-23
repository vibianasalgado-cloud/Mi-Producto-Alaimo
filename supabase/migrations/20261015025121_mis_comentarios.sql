create table public.mis_comentarios (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  mensaje text not null check (length(mensaje) between 1 and 2000),
  email text check (email is null or (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254)),
  created_at timestamptz not null default now()
);

create index mis_comentarios_user_id_idx on public.mis_comentarios (user_id);

alter table public.mis_comentarios enable row level security;

-- Cada usuario inserta, lee, edita y borra solo lo suyo
create policy "usuario inserta lo suyo" on public.mis_comentarios
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "usuario lee lo suyo" on public.mis_comentarios
  for select to authenticated using (user_id = (select auth.uid()));
create policy "usuario edita lo suyo" on public.mis_comentarios
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "usuario borra lo suyo" on public.mis_comentarios
  for delete to authenticated using (user_id = (select auth.uid()));

-- El admin (por correo) lee todo
create policy "admin lee todo" on public.mis_comentarios
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'vibiana.salgado@gmail.com');
