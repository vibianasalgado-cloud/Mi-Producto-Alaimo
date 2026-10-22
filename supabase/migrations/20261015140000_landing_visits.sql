-- Visitas a la landing pública: una fila por visitante (cookie anónima) por día.
-- No guarda correo, IP ni datos personales: solo un identificador aleatorio.
create table public.landing_visits (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  day date not null default ((now() at time zone 'America/Bogota')::date),
  created_at timestamptz not null default now(),
  unique (visitor_id, day)
);

alter table public.landing_visits enable row level security;

-- Cualquier visitante registra su visita de hoy (no se aceptan días distintos al actual)
create policy "visitantes insertan" on public.landing_visits
  for insert to anon, authenticated
  with check (day = ((now() at time zone 'America/Bogota')::date));

-- Solo el admin (por correo) lee; nadie edita ni borra
create policy "admin lee todo" on public.landing_visits
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'vibiana.salgado@gmail.com');
