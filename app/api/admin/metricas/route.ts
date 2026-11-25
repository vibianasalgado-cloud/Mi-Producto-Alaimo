import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/admin';
import { CONTACTO_RAPIDO } from '@/lib/flags';

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

  const [interesados, visitas, visitasLanding, simulaciones, todosSignups, todosRapidos, flag] = await Promise.all([
    todas<{ user_id: string; quiere_ser_contactado: boolean; como_hacerlo: string | null; donde_comprar: string | null }>(
      'interesados',
      'user_id, quiere_ser_contactado, como_hacerlo, donde_comprar',
    ),
    todas<{ user_id: string; day: string }>('visits', 'user_id, day'),
    todas<{ visitor_id: string; day: string }>('landing_visits', 'visitor_id, day'),
    todas<{ visitor_id: string; day: string; created_at: string }>('simulaciones', 'visitor_id, day, created_at'),
    todas<{
      email: string;
      visitor_id: string | null;
      simulacion_monto: number | null;
      simulacion_cuotas: number | null;
      de_admin: boolean;
      created_at: string;
    }>('signups', 'email, visitor_id, simulacion_monto, simulacion_cuotas, de_admin, created_at'),
    todas<{ visitor_id: string | null; de_admin: boolean; created_at: string }>(
      'contactos_rapidos',
      'visitor_id, de_admin, created_at',
    ),
    admin
      .from('feature_flags')
      .select('encendida, encendida_at, primera_encendida_at, actualizada_at')
      .eq('clave', CONTACTO_RAPIDO)
      .maybeSingle<{
        encendida: boolean;
        encendida_at: string | null;
        primera_encendida_at: string | null;
        actualizada_at: string;
      }>(),
  ]);
  if (!interesados || !visitas || !visitasLanding || !simulaciones || !todosSignups || !todosRapidos || flag.error)
    return NextResponse.json({ error: 'No se pudieron cargar las métricas.' }, { status: 500 });
  // Los envíos de prueba del admin no cuentan (igual que sus visitas y simulaciones)
  const signups = todosSignups.filter((s) => !s.de_admin);
  const rapidos = todosRapidos.filter((r) => !r.de_admin);

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

  // Formulario de la landing: cada envío es una fila; las personas se cuentan por correo.
  // Los envíos con visitor_id (desde que se guarda) se unen con las visitas y simulaciones del mismo visitante.
  const personas = new Set(signups.map((s) => s.email.toLowerCase())).size;
  const visitantesConDatos = new Set(signups.map((s) => s.visitor_id).filter((v): v is string => v !== null));
  const visitantesLanding = new Set(visitasLanding.map((v) => v.visitor_id));
  const dejaronDatos = [...visitantesLanding].filter((v) => visitantesConDatos.has(v)).length;

  // Simulador: visitantes únicos que lo usaron y cuántos de ellos dejaron datos con la simulación adjunta
  // (un envío sin simulación del mismo visitante no cuenta: no muestra que el simulador llevó al contacto)
  const conSimulacion = signups.filter((s) => s.simulacion_monto !== null && s.simulacion_cuotas !== null);
  const visitantesConSim = new Set(conSimulacion.map((s) => s.visitor_id).filter((v): v is string => v !== null));
  const visitantesSim = new Set(simulaciones.map((s) => s.visitor_id));
  const simularon = visitantesSim.size;
  const simularonYDejaron = [...visitantesSim].filter((v) => visitantesConSim.has(v)).length;
  const desdeSim = simulaciones.reduce<string | null>((min, s) => (min === null || s.day < min ? s.day : min), null);
  const promedio = (ns: number[]) => (ns.length === 0 ? 0 : ns.reduce((a, b) => a + b, 0) / ns.length);

  // Experimento "contacto rápido" (product/hypotheses/contacto-rapido-simulador.md).
  // Ventana: desde la última vez que se encendió el interruptor hasta ahora (o hasta que se apagó).
  // Señal: de los visitantes que simularon en la ventana, cuántos dejaron sus datos en la ventana
  // (formulario corto, o largo con simulación adjunta). El divisor es una aproximación por horario:
  // no se marca qué visitas vieron el formulario corto.
  // Línea base: la misma tasa antes del PRIMER encendido (solo formulario largo), para que
  // apagar y volver a encender no meta rondas anteriores del experimento en la línea base.
  const f = flag.data;
  const inicio = f?.encendida_at ? Date.parse(f.encendida_at) : null;
  const primera = f?.primera_encendida_at ? Date.parse(f.primera_encendida_at) : inicio;
  const fin = f && !f.encendida ? Date.parse(f.actualizada_at) : null;
  const enVentana = (iso: string) => {
    const t = Date.parse(iso);
    return inicio !== null && t >= inicio && (fin === null || t <= fin);
  };
  const antes = (iso: string) => primera === null || Date.parse(iso) < primera;
  const visitantesDe = <T extends { visitor_id: string | null }>(filas: T[]) =>
    new Set(filas.map((r) => r.visitor_id).filter((v): v is string => v !== null));
  const cuantos = (de: Set<string>, en: Set<string>) => [...de].filter((v) => en.has(v)).length;

  const cortoVentana = visitantesDe(rapidos.filter((r) => enVentana(r.created_at)));
  const largoVentana = visitantesDe(conSimulacion.filter((s) => enVentana(s.created_at)));
  // simulaciones guarda una fila por visitante y día con la hora de la primera simulación: quien simuló
  // ese mismo día antes de encender y luego envió cualquiera de los dos formularios con simulación
  // (los dos exigen haber simulado) igual cuenta. Se suman los dos para no inclinar la señal hacia el corto.
  const simVentana = visitantesDe(simulaciones.filter((s) => enVentana(s.created_at)));
  cortoVentana.forEach((v) => simVentana.add(v));
  largoVentana.forEach((v) => simVentana.add(v));
  const dejaronVentana = [...simVentana].filter((v) => cortoVentana.has(v) || largoVentana.has(v)).length;
  const pctVentana = pct(dejaronVentana, simVentana.size);

  const simAntes = visitantesDe(simulaciones.filter((s) => antes(s.created_at)));
  const largoAntes = visitantesDe(conSimulacion.filter((s) => antes(s.created_at)));
  const dejaronAntes = cuantos(simAntes, largoAntes);
  const pctAntes = pct(dejaronAntes, simAntes.size);

  // Regla de decisión escrita en la hipótesis antes de encender. Sin la muestra mínima o sin línea base
  // no se decide: se muestra lo que diría la regla hoy, como referencia.
  const MUESTRA_MINIMA = 100;
  const regla =
    simVentana.size === 0
      ? null
      : pctVentana < 10 || pctVentana <= pctAntes
        ? 'parar'
        : pctVentana >= 25 && pctVentana >= 1.5 * pctAntes
          ? 'avanzar'
          : 'iterar';
  const decision =
    inicio === null
      ? 'sin_iniciar'
      : simVentana.size === 0
        ? 'sin_datos'
        : simAntes.size === 0
          ? 'sin_linea_base'
          : simVentana.size < MUESTRA_MINIMA
            ? 'muestra_insuficiente'
            : regla!;
  const diasEncendido = inicio === null ? 0 : Math.floor(((fin ?? Date.now()) - inicio) / DIA_MS);

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
      dejaronDatos,
      pctDatos: pct(dejaronDatos, visitantes),
      envios: signups.length,
      personas,
    },
    simulador: {
      visitantes: simularon,
      desde: desdeSim,
      pct: pct(simularon, visitantes),
      dejaronDatos: simularonYDejaron,
      pctDatos: pct(simularonYDejaron, simularon),
      contactos: conSimulacion.length,
      montoPromedio: Math.round(promedio(conSimulacion.map((s) => s.simulacion_monto!))),
      cuotasPromedio: Math.round(promedio(conSimulacion.map((s) => s.simulacion_cuotas!)) * 10) / 10,
    },
    experimento: {
      encendida: f?.encendida ?? false,
      desde: f?.encendida_at ?? null,
      hasta: fin !== null ? f!.actualizada_at : null,
      simularon: simVentana.size,
      dejaronDatos: dejaronVentana,
      pct: pctVentana,
      corto: cuantos(simVentana, cortoVentana),
      largo: cuantos(simVentana, largoVentana),
      enviosCortos: rapidos.filter((r) => enVentana(r.created_at)).length,
      base: { simularon: simAntes.size, dejaronDatos: dejaronAntes, pct: pctAntes, hasta: f?.primera_encendida_at ?? null },
      muestraMinima: MUESTRA_MINIMA,
      diasEncendido,
      regla,
      decision,
    },
    semanas: semanas.map((s) => ({ semana: s, nuevos: nuevos.get(s)!, activos: activos.get(s)!.size })),
  });
}
