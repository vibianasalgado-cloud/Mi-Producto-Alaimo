create table public.visits (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day date not null default ((now() at time zone 'America/Bogota')::date),
  created_at timestamptz not null default now(),
  unique (user_id, day)
);

create index visits_user_id_idx on public.visits (user_id);

alter table public.visits enable row level security;

-- Cada usuario registra y lee solo sus propias visitas (no se editan ni se borran)
create policy "usuario inserta lo suyo" on public.visits
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "usuario lee lo suyo" on public.visits
  for select to authenticated using (user_id = (select auth.uid()));

-- El admin (por correo) lee todo
create policy "admin lee todo" on public.visits
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'vibiana.salgado@gmail.com');
