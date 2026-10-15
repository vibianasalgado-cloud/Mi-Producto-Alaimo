import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { esEmail } from '@/lib/validar';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body.website) return NextResponse.json({ ok: true }); // honeypot
  const mensaje = typeof body.mensaje === 'string' ? body.mensaje.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!mensaje) return NextResponse.json({ error: 'Escribe tu comentario.' }, { status: 400 });
  if (mensaje.length > 2000) return NextResponse.json({ error: 'El comentario es muy largo.' }, { status: 400 });
  if (email && !esEmail(email))
    return NextResponse.json({ error: 'El correo no parece válido. Corrígelo o déjalo vacío.' }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase.from('feedback').insert({ mensaje, email: email || null });
  if (error) return NextResponse.json({ error: 'No pudimos enviar tu mensaje.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
