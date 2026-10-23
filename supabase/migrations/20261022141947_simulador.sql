-- Simulador de crédito en la landing.
-- 1) El formulario de interés puede llevar la simulación que el visitante adjuntó.
alter table public.signups
  add column simulacion_monto integer check (simulacion_monto between 300000 and 5000000),
  add column simulacion_cuotas smallint check (simulacion_cuotas in (3, 6, 12, 18, 24)),
  add constraint signups_simulacion_completa
    check ((simulacion_monto is null) = (simulacion_cuotas is null));

-- 2) Quién usó el simulador: una fila por visitante (cookie anónima) por día.
-- No guarda montos, correo, IP ni datos personales: solo un identificador aleatorio.
create table public.simulaciones (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  day date not null default ((now() at time zone 'America/Bogota')::date),
  created_at timestamptz not null default now(),
  unique (visitor_id, day)
);

alter table public.simulaciones enable row level security;

-- Cualquier visitante registra su simulación de hoy (no se aceptan días distintos al actual)
create policy "visitantes insertan" on public.simulaciones
  for insert to anon, authenticated
  with check (day = ((now() at time zone 'America/Bogota')::date));

-- Solo el admin (por correo) lee; nadie edita ni borra
create policy "admin lee todo" on public.simulaciones
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'vibiana.salgado@gmail.com');
