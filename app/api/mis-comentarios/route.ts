import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { esEmail } from '@/lib/validar';

async function sesion() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

export async function GET() {
  const { supabase, user } = await sesion();
  if (!user) return NextResponse.json({ error: 'Sin sesión.' }, { status: 401 });
  const { data, error } = await supabase.from('mis_comentarios').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'No se pudieron cargar tus comentarios.' }, { status: 500 });
  return NextResponse.json({ email: user.email, filas: data });
}

export async function POST(req: Request) {
  const { supabase, user } = await sesion();
  if (!user) return NextResponse.json({ error: 'Sin sesión.' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const mensaje = texto(b.mensaje);
  const email = texto(b.email);
  if (!mensaje) return NextResponse.json({ error: 'Escribe tu comentario.' }, { status: 400 });
  if (mensaje.length > 2000)
    return NextResponse.json({ error: 'El comentario es muy largo (máximo 2000).' }, { status: 400 });
  if (email && (email.length > 254 || !esEmail(email)))
    return NextResponse.json({ error: 'El correo no parece válido. Corrígelo o déjalo vacío.' }, { status: 400 });

  const { error } = await supabase.from('mis_comentarios').insert({ mensaje, email: email || null });
  if (error) return NextResponse.json({ error: 'No pudimos guardar. Intenta de nuevo.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
