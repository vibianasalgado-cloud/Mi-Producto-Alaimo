import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Igual que el CHECK de interesados.canal_contacto
const CANALES = ['whatsapp', 'llamada', 'correo'];

async function sesion() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

const error400 = (error: string) => NextResponse.json({ error }, { status: 400 });

// Valida el cuerpo de crear y editar; devuelve la fila a guardar o una respuesta 400.
function leerRegistro(b: Record<string, unknown>) {
  const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const oferta = texto(b.oferta_comercios);
  const como = texto(b.como_hacerlo);
  const donde = texto(b.donde_comprar);
  if (!oferta) return error400('Cuéntanos qué ofrecimiento te interesa.');
  if ([oferta, como, donde].some((t) => t.length > 500)) return error400('Alguno de los textos es muy largo (máximo 500).');

  const crudo = b.canal_contacto;
  if (crudo !== undefined && crudo !== null && typeof crudo !== 'string')
    return error400('Elige WhatsApp, llamada o correo como forma de contacto.');
  const canal = texto(crudo);
  if (canal && !CANALES.includes(canal)) return error400('Elige WhatsApp, llamada o correo como forma de contacto.');

  const contacto = b.quiere_ser_contactado === true;
  return {
    oferta_comercios: oferta,
    como_hacerlo: como || null,
    donde_comprar: donde || null,
    quiere_ser_contactado: contacto,
    // Sin permiso de contacto no se guarda canal
    canal_contacto: contacto && canal ? canal : null,
  };
}

export async function GET() {
  const { supabase, user } = await sesion();
  if (!user) return NextResponse.json({ error: 'Sin sesión.' }, { status: 401 });
  const { data, error } = await supabase.from('interesados').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'No se pudieron cargar tus datos.' }, { status: 500 });
  return NextResponse.json({ email: user.email, filas: data });
}

export async function POST(req: Request) {
  const { supabase, user } = await sesion();
  if (!user) return NextResponse.json({ error: 'Sin sesión.' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const fila = leerRegistro(b ?? {});
  if (fila instanceof NextResponse) return fila;

  const { error } = await supabase.from('interesados').insert(fila);
  if (error) return NextResponse.json({ error: 'No pudimos guardar. Intenta de nuevo.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const { supabase, user } = await sesion();
  if (!user) return NextResponse.json({ error: 'Sin sesión.' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const id = b?.id;
  if (!Number.isSafeInteger(id) || id <= 0) return error400('No encontramos ese registro.');
  const fila = leerRegistro(b);
  if (fila instanceof NextResponse) return fila;

  // El RLS solo deja editar filas propias; si no es suya, no se actualiza ninguna
  const { data, error } = await supabase.from('interesados').update(fila).eq('id', id).select('id');
  if (error) return NextResponse.json({ error: 'No pudimos guardar los cambios. Intenta de nuevo.' }, { status: 500 });
  if (!data || data.length === 0)
    return NextResponse.json({ error: 'No encontramos ese registro.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
