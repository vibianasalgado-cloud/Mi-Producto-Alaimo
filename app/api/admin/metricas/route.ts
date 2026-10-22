import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/admin';

const SEMANAS = 8;
const DIA_MS = 24 * 60 * 60 * 1000;

// Fecha (AAAA-MM-DD) en hora de Bogotá (UTC-5, sin horario de verano).
const diaBogota = (d: Date) => new Date(d.getTime() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);

// Lunes de la semana (AAAA-MM-DD) al que pertenece un día AAAA-MM-DD.
function lunes(dia: string) {
  const d = new Date(dia + 'T00:00:00Z');
  const desdeLunes = (d.getUTCDay() + 6) % 7;
  return new Date(d.getTime() - desdeLunes * DIA_MS).toISOString().slice(0, 10);
}

const pct = (n: number, total: number) => (total === 0 ? 0 : Math.round((n / total) * 1000) / 10);

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: 'Sin sesión.' }, { status: 401 });
  if (!isAdmin(data.user.email)) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });

  const admin = createAdminClient();

  const usuarios: { id: string; created_at: string }[] = [];
  for (let page = 1; ; page++) {
    const { data: lote, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return NextResponse.json({ error: 'No se pudieron cargar las métricas.' }, { status: 500 });
    usuarios.push(...lote.users.map((u) => ({ id: u.id, created_at: u.created_at })));
    if (lote.users.length < 1000) break;
  }

  // PostgREST devuelve máximo 1000 filas por consulta: se pagina para no truncar.
  async function todas<T>(tabla: string, columnas: string): Promise<T[] | null> {
    const filas: T[] = [];
    for (let desde = 0; ; desde += 1000) {
      const { data: lote, error } = await admin
        .from(tabla)
        .select(columnas)
        .order('id')
        .range(desde, desde + 999);
      if (error) return null;
      filas.push(...(lote as T[]));
      if (lote.length < 1000) return filas;
    }
  }

  const [interesados, visitas, visitasLanding] = await Promise.all([
    todas<{ user_id: string; quiere_ser_contactado: boolean; como_hacerlo: string | null; donde_comprar: string | null }>(
      'interesados',
      'user_id, quiere_ser_contactado, como_hacerlo, donde_comprar',
    ),
    todas<{ user_id: string; day: string }>('visits', 'user_id, day'),
    todas<{ visitor_id: string; day: string }>('landing_visits', 'visitor_id, day'),
  ]);
  if (!interesados || !visitas || !visitasLanding)
    return NextResponse.json({ error: 'No se pudieron cargar las métricas.' }, { status: 500 });

  const total = usuarios.length;
  const ids = new Set(usuarios.map((u) => u.id));

  const conRegistro = new Set(interesados.map((r) => r.user_id).filter((id) => ids.has(id)));

  // Solicitudes de contacto (registros con "quiero ser contactado")
  const solicitudes = interesados.filter((r) => r.quiere_ser_contactado && ids.has(r.user_id));
  const conContacto = new Set(solicitudes.map((r) => r.user_id));
  const conDetalle = solicitudes.filter((r) => r.como_hacerlo?.trim() || r.donde_comprar?.trim()).length;

  // Landing: visitantes únicos (por cookie anónima) desde que se empezó a contar
  const visitantes = new Set(visitasLanding.map((v) => v.visitor_id)).size;
  const desde = visitasLanding.reduce<string | null>((min, v) => (min === null || v.day < min ? v.day : min), null);

  const diasPorUsuario = new Map<string, Set<string>>();
  for (const v of visitas) {
    if (!ids.has(v.user_id)) continue;
    if (!diasPorUsuario.has(v.user_id)) diasPorUsuario.set(v.user_id, new Set());
    diasPorUsuario.get(v.user_id)!.add(v.day);
  }
  const quienesVolvieron = [...diasPorUsuario.values()].filter((dias) => dias.size >= 2).length;

  // Semanas, de la más antigua a la actual.
  const semanaActual = lunes(diaBogota(new Date()));
  const semanas = Array.from({ length: SEMANAS }, (_, i) =>
    new Date(new Date(semanaActual + 'T00:00:00Z').getTime() - (SEMANAS - 1 - i) * 7 * DIA_MS).toISOString().slice(0, 10),
  );
  const nuevos = new Map(semanas.map((s) => [s, 0]));
  const activos = new Map(semanas.map((s) => [s, new Set<string>()]));

  for (const u of usuarios) {
    const s = lunes(diaBogota(new Date(u.created_at)));
    if (nuevos.has(s)) nuevos.set(s, nuevos.get(s)! + 1);
  }
  for (const v of visitas) {
    if (!ids.has(v.user_id)) continue;
    activos.get(lunes(v.day))?.add(v.user_id);
  }

  return NextResponse.json({
    email: data.user.email,
    usuarios: total,
    activacion: { n: conRegistro.size, pct: pct(conRegistro.size, total) },
    retorno: { n: quienesVolvieron, pct: pct(quienesVolvieron, total) },
    contacto: { n: conContacto.size, pct: pct(conContacto.size, total) },
    contactoDeInteresados: { n: conContacto.size, de: conRegistro.size, pct: pct(conContacto.size, conRegistro.size) },
    intencion: { n: conDetalle, de: solicitudes.length, pct: pct(conDetalle, solicitudes.length) },
    landing: {
      visitantes,
      desde,
      interesados: conRegistro.size,
      pct: pct(conRegistro.size, visitantes),
      pctContacto: pct(conContacto.size, visitantes),
    },
    semanas: semanas.map((s) => ({ semana: s, nuevos: nuevos.get(s)!, activos: activos.get(s)!.size })),
  });
}
