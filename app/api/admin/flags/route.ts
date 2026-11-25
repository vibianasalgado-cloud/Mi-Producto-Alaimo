import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/admin';

// Interruptores de features (tabla feature_flags). Solo el admin los lee y los cambia, con la llave secreta.
async function soloAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: 'Sin sesión.' }, { status: 401 });
  if (!isAdmin(data.user.email)) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  return null;
}

const COLUMNAS = 'clave, encendida, encendida_at, primera_encendida_at, actualizada_at';

export async function GET() {
  const bloqueo = await soloAdmin();
  if (bloqueo) return bloqueo;
  const { data, error } = await createAdminClient().from('feature_flags').select(COLUMNAS).order('clave');
  if (error) return NextResponse.json({ error: 'No se pudieron cargar los interruptores.' }, { status: 500 });
  return NextResponse.json({ flags: data });
}

export async function PATCH(req: Request) {
  const bloqueo = await soloAdmin();
  if (bloqueo) return bloqueo;
  const body = await req.json().catch(() => null);
  const clave = typeof body?.clave === 'string' ? body.clave : '';
  if (!/^[a-z0-9_]{3,60}$/.test(clave) || typeof body?.encendida !== 'boolean')
    return NextResponse.json({ error: 'Datos del interruptor no válidos.' }, { status: 400 });

  const admin = createAdminClient();
  const { data: actual, error: errorLectura } = await admin
    .from('feature_flags')
    .select(COLUMNAS)
    .eq('clave', clave)
    .maybeSingle();
  if (errorLectura) return NextResponse.json({ error: 'No se pudo cambiar el interruptor.' }, { status: 500 });
  if (!actual) return NextResponse.json({ error: 'Ese interruptor no existe.' }, { status: 404 });
  // Idempotente: si ya está en ese estado (otra pestaña, doble clic) no se tocan las fechas,
  // porque de ellas depende la ventana del experimento.
  if (actual.encendida === body.encendida) return NextResponse.json({ flag: actual });

  const ahora = new Date().toISOString();
  // Al encender se guarda la fecha: las métricas del experimento cuentan desde ahí.
  // La primera vez también se guarda en primera_encendida_at: ahí termina la línea base.
  const cambios: Record<string, unknown> = { encendida: body.encendida, actualizada_at: ahora };
  if (body.encendida) {
    cambios.encendida_at = ahora;
    if (!actual.primera_encendida_at) cambios.primera_encendida_at = ahora;
  }

  const { data, error } = await admin
    .from('feature_flags')
    .update(cambios)
    .eq('clave', clave)
    .eq('encendida', !body.encendida) // si otra petición lo cambió entre tanto, no se pisa
    .select(COLUMNAS)
    .maybeSingle();
  if (error) return NextResponse.json({ error: 'No se pudo cambiar el interruptor.' }, { status: 500 });
  if (!data) {
    const { data: ahoraEs } = await admin.from('feature_flags').select(COLUMNAS).eq('clave', clave).maybeSingle();
    return NextResponse.json({ flag: ahoraEs ?? actual });
  }
  return NextResponse.json({ flag: data });
}
