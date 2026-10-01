create table public.signups (
  id bigint generated always as identity primary key,
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  mensaje text check (mensaje is null or length(mensaje) <= 500),
  created_at timestamptz not null default now()
);

create table public.feedback (
  id bigint generated always as identity primary key,
  mensaje text not null check (length(mensaje) between 1 and 2000),
  email text check (email is null or (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254)),
  created_at timestamptz not null default now()
);

alter table public.signups enable row level security;
alter table public.feedback enable row level security;

-- Cualquier visitante puede insertar
create policy "visitantes insertan" on public.signups
  for insert to anon, authenticated with check (true);
create policy "visitantes insertan" on public.feedback
  for insert to anon, authenticated with check (true);

-- Solo usuarios con sesión iniciada pueden leer
create policy "autenticados leen" on public.signups
  for select to authenticated using (true);
create policy "autenticados leen" on public.feedback
  for select to authenticated using (true);
