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

  const mensaje = typeof data.mensaje === 'string' ? data.mensaje.trim() : '';
  const email = typeof data.email === 'string' && data.email.trim() ? data.email.trim() : null;
  if (
    mensaje.length < 1 ||
    mensaje.length > 2000 ||
    (email !== null && (!EMAIL_RE.test(email) || email.length > 254))
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { error } = await supabaseServer().from('feedback').insert({ mensaje, email });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
