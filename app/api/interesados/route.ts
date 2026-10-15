import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function sesion() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
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
  const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const oferta = texto(b.oferta_comercios);
  const como = texto(b.como_hacerlo);
  const donde = texto(b.donde_comprar);
  if (!oferta) return NextResponse.json({ error: 'Cuéntanos qué ofrecimiento te interesa.' }, { status: 400 });
  if ([oferta, como, donde].some((t) => t.length > 500))
    return NextResponse.json({ error: 'Alguno de los textos es muy largo (máximo 500).' }, { status: 400 });

  const { error } = await supabase.from('interesados').insert({
    oferta_comercios: oferta,
    como_hacerlo: como || null,
    donde_comprar: donde || null,
    quiere_ser_contactado: b.quiere_ser_contactado === true,
  });
  if (error) return NextResponse.json({ error: 'No pudimos guardar. Intenta de nuevo.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
