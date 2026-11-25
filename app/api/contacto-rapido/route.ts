import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { visitorIdActual } from '@/lib/visitante';
import { isAdmin } from '@/lib/admin';
import { CONTACTO_RAPIDO, featureEncendida } from '@/lib/flags';

// Formulario corto del simulador (experimento "contacto rápido", nivel 1).
// Mismas reglas que los CHECK de contactos_rapidos; la política de insert además exige el interruptor encendido.
const CANALES = ['whatsapp', 'llamada'];
const CUOTAS = [3, 6, 12, 18, 24];

const error = (msg: string) => NextResponse.json({ error: msg }, { status: 400 });

export async function POST(req: Request) {
  // Con el interruptor apagado la ruta no existe (404). El mensaje sirve a quien tenía la página abierta cuando se apagó.
  if (!(await featureEncendida(CONTACTO_RAPIDO)))
    return NextResponse.json(
      { error: 'Este formulario ya no está disponible. Usa el formulario completo de abajo.' },
      { status: 404 },
    );

  const leido = await req.json().catch(() => null);
  const body = leido && typeof leido === 'object' ? leido : {};
  if (body.website) return NextResponse.json({ ok: true }); // honeypot
  const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

  // Se cuentan caracteres como Postgres (un emoji = 1), no unidades UTF-16
  const nombre = texto(body.nombre_completo).replace(/\s+/g, ' ');
  if ([...nombre].length < 3) return error('Escribe tu nombre: al menos 3 letras.');
  if ([...nombre].length > 120) return error('Tu nombre es muy largo: máximo 120 caracteres.');

  const canal = texto(body.canal_contacto);
  if (!CANALES.includes(canal)) return error('Elige WhatsApp o llamada.');

  const celular = texto(body.celular)
    .replace(/[\s().-]/g, '')
    .replace(/^\+?57(?=3\d{9}$)/, '');
  if (!/^3[0-9]{9}$/.test(celular)) return error('Escribe tu celular: 10 dígitos que empiecen por 3.');

  const monto = body.simulacion_monto;
  const cuotas = body.simulacion_cuotas;
  if (!Number.isInteger(monto) || monto < 300000 || monto > 5000000)
    return error('El valor simulado debe estar entre $300.000 y $5.000.000.');
  if (!CUOTAS.includes(cuotas)) return error('El número de cuotas no es válido.');

  if (body.autoriza_datos !== true) return error('Para contactarte necesitamos tu autorización de tratamiento de datos.');

  // autoriza_datos_at lo pone la base (default now()); los envíos del admin se marcan para no contarlos.
  const supabase = await createClient();
  const { data: sesion } = await supabase.auth.getUser();
  const { error: falla } = await supabase.from('contactos_rapidos').insert({
    nombre_completo: nombre,
    canal_contacto: canal,
    celular,
    simulacion_monto: monto,
    simulacion_cuotas: cuotas,
    de_admin: isAdmin(sesion.user?.email),
    visitor_id: await visitorIdActual(),
  });
  if (falla) return NextResponse.json({ error: 'No pudimos enviar tus datos. Intenta de nuevo.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
