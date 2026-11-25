-- Interruptores de features (feature flags) y formulario corto de contacto desde el simulador.
-- Experimento: product/hypotheses/contacto-rapido-simulador.md (nivel 1 del plan de exposición).

-- 1) Interruptores: una fila por feature, apagada por defecto.
create table public.feature_flags (
  clave text primary key check (clave ~ '^[a-z0-9_]{3,60}$'),
  encendida boolean not null default false,
  encendida_at timestamptz,            -- última vez que se encendió (las métricas cuentan desde aquí)
  primera_encendida_at timestamptz,    -- primera vez que se encendió (la línea base termina aquí)
  actualizada_at timestamptz not null default now()
);

-- RLS sin políticas: con la llave pública nadie la lee ni la cambia.
-- Solo la llave secreta (rutas de /api/admin) la lee y la cambia.
alter table public.feature_flags enable row level security;

insert into public.feature_flags (clave) values ('contacto_rapido_simulador');

-- La landing (en el servidor, con la llave pública) solo necesita saber si una feature está encendida:
-- esta función devuelve ese booleano y nada más de la tabla. El aviso del advisor de Supabase
-- ("SECURITY DEFINER ejecutable por anon") es intencional: la política de insert de contactos_rapidos
-- también la llama como anon. No usar claves que revelen planes sin anunciar.
create function public.feature_encendida(p_clave text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select f.encendida from public.feature_flags f where f.clave = p_clave), false);
$$;

revoke all on function public.feature_encendida(text) from public;
grant execute on function public.feature_encendida(text) to anon, authenticated;

-- 2) Envíos del formulario corto del simulador (sin documento ni correo).
create table public.contactos_rapidos (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  nombre_completo text not null check (char_length(nombre_completo) between 3 and 120),
  canal_contacto text not null check (canal_contacto in ('whatsapp', 'llamada')),
  celular text not null check (celular ~ '^3[0-9]{9}$'),
  simulacion_monto integer not null check (simulacion_monto between 300000 and 5000000),
  simulacion_cuotas smallint not null check (simulacion_cuotas in (3, 6, 12, 18, 24)),
  visitor_id uuid,
  autoriza_datos_at timestamptz not null default now(),
  de_admin boolean not null default false
);

alter table public.contactos_rapidos enable row level security;

-- Cualquier visitante inserta, solo con el interruptor encendido y con la autorización del momento del envío.
-- Solo la sesión del admin puede marcar un envío como suyo (mismo correo que las demás políticas).
create policy "visitantes insertan" on public.contactos_rapidos
  for insert to anon, authenticated
  with check (
    public.feature_encendida('contacto_rapido_simulador')
    and autoriza_datos_at = now()
    and (not de_admin or lower(auth.jwt() ->> 'email') = 'vibiana.salgado@gmail.com')
  );

-- Solo el admin (por correo) lee; nadie edita ni borra
create policy "admin lee todo" on public.contactos_rapidos
  for select to authenticated
  using (lower(auth.jwt() ->> 'email') = 'vibiana.salgado@gmail.com');
