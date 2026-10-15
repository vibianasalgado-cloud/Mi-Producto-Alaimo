import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (data.website) return NextResponse.json({ ok: true }); // honeypot

  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const mensaje = typeof data.mensaje === 'string' ? data.mensaje.trim() : null;
  if (!EMAIL_RE.test(email) || email.length > 254 || (mensaje && mensaje.length > 500)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { error } = await supabaseServer().from('signups').insert({ email, mensaje });
  if (error && error.code !== '23505') {
    // 23505: correo ya registrado, se trata como éxito
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
