import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { esEmail } from '@/lib/validar';
import { visitorIdActual } from '@/lib/visitante';
import { isAdmin } from '@/lib/admin';

const DEFAULT = 'Quiero ser contactado, estoy interesado(a) en un crédito';
const CUOTAS = [3, 6, 12, 18, 24];
// Mismos formatos que el CHECK signups_documento_valido
const DOCUMENTO: Record<string, RegExp> = {
  CC: /^[0-9]{5,10}$/,
  PPT: /^[0-9]{5,10}$/,
  CE: /^[A-Za-z0-9]{5,12}$/,
  PA: /^[A-Za-z0-9]{5,12}$/,
};

const error = (msg: string) => NextResponse.json({ error: msg }, { status: 400 });

export async function POST(req: Request) {
  const leido = await req.json().catch(() => null);
  const body = leido && typeof leido === 'object' ? leido : {};
  if (body.website) return NextResponse.json({ ok: true }); // honeypot
  const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const email = texto(body.email);
  const mensaje = texto(body.mensaje) || DEFAULT;
  const nombre = texto(body.nombre_completo).replace(/\s+/g, ' ');
  const tipo = texto(body.tipo_documento);
  const numero = texto(body.numero_documento).replace(/[\s.-]/g, '');

  // Se cuentan caracteres como Postgres (un emoji = 1), no unidades UTF-16
  if ([...nombre].length < 3 || [...nombre].length > 120) return error('Escribe tus nombres y apellidos completos.');
  if (!DOCUMENTO[tipo]) return error('Elige tu tipo de documento.');
  if (!DOCUMENTO[tipo].test(numero))
    return error(
      tipo === 'CC' || tipo === 'PPT'
        ? 'El número de documento debe tener entre 5 y 10 dígitos.'
        : 'El número de documento debe tener entre 5 y 12 letras o números.',
    );
  if (!esEmail(email)) return error('Escribe un correo válido.');
  if (mensaje.length > 500) return error('El mensaje es muy largo.');
  if (body.autoriza_datos !== true) return error('Para contactarte necesitamos tu autorización de tratamiento de datos.');

  // Simulación adjunta (opcional): mismos límites que los CHECK de signups
  const monto = body.simulacion_monto ?? null;
  const cuotas = body.simulacion_cuotas ?? null;
  if ((monto === null) !== (cuotas === null)) return error('La simulación está incompleta.');
  if (monto !== null && (!Number.isInteger(monto) || monto < 300000 || monto > 5000000))
    return error('El valor simulado debe estar entre $300.000 y $5.000.000.');
  if (cuotas !== null && !CUOTAS.includes(cuotas)) return error('El número de cuotas no es válido.');

  // Cada envío es una fila nueva (la misma persona puede volver con otra simulación).
  // autoriza_datos_at lo pone la base (default now()); los envíos del admin se marcan para no contarlos.
  const supabase = await createClient();
  const { data: sesion } = await supabase.auth.getUser();
  const { error: falla } = await supabase.from('signups').insert({
    email,
    mensaje,
    nombre_completo: nombre,
    tipo_documento: tipo,
    numero_documento: numero.toUpperCase(),
    de_admin: isAdmin(sesion.user?.email),
    simulacion_monto: monto,
    simulacion_cuotas: cuotas,
    visitor_id: await visitorIdActual(),
  });
  if (falla) return NextResponse.json({ error: 'No pudimos enviar tus datos. Intenta de nuevo.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
