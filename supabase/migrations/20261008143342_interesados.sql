create table public.interesados (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  email text not null default (auth.jwt() ->> 'email'),
  oferta_comercios text not null check (length(oferta_comercios) between 1 and 500),
  como_hacerlo text check (como_hacerlo is null or length(como_hacerlo) <= 500),
  donde_comprar text check (donde_comprar is null or length(donde_comprar) <= 500),
  quiere_ser_contactado boolean not null default false,
  created_at timestamptz not null default now()
);

create index interesados_user_id_idx on public.interesados (user_id);

alter table public.interesados enable row level security;

-- Cada usuario inserta, lee, edita y borra solo lo suyo
create policy "usuario inserta lo suyo" on public.interesados
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "usuario lee lo suyo" on public.interesados
  for select to authenticated using (user_id = (select auth.uid()));
create policy "usuario edita lo suyo" on public.interesados
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "usuario borra lo suyo" on public.interesados
  for delete to authenticated using (user_id = (select auth.uid()));

-- El admin (por correo) lee todo
create policy "admin lee todo" on public.interesados
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'vibiana.salgado@gmail.com');
