import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { esEmail } from '@/lib/validar';

const DEFAULT = 'Quiero ser contactado, estoy interesado(a) en un crédito';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body.website) return NextResponse.json({ ok: true }); // honeypot
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const mensaje = (typeof body.mensaje === 'string' ? body.mensaje.trim() : '') || DEFAULT;
  if (!esEmail(email)) return NextResponse.json({ error: 'Escribe un correo válido.' }, { status: 400 });
  if (mensaje.length > 500) return NextResponse.json({ error: 'El mensaje es muy largo.' }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase.from('signups').insert({ email, mensaje });
  if (error && error.code !== '23505') return NextResponse.json({ error: 'No pudimos enviar tu mensaje.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
