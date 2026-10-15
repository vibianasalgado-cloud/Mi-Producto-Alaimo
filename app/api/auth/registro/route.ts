import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { esEmail } from '@/lib/validar';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!esEmail(email)) return NextResponse.json({ error: 'Escribe un correo válido.' }, { status: 400 });
  if (password.length < 6 || password.length > 72)
    return NextResponse.json({ error: 'La contraseña debe tener entre 6 y 72 caracteres.' }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return NextResponse.json({ error: 'No se pudo crear la cuenta: ' + error.message }, { status: 400 });
  if (!data.session) return NextResponse.json({ ok: true, confirmar: true });
  return NextResponse.json({ ok: true });
}
