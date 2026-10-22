import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';

const COOKIE = 'vid';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

// Una fila por visitante por día. El visitante se reconoce por una cookie aleatoria (sin datos personales).
export async function POST(req: Request) {
  if (BOT_RE.test(req.headers.get('user-agent') ?? '')) return NextResponse.json({ ok: true });

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (isAdmin(data.user?.email)) return NextResponse.json({ ok: true }); // no contar al admin

  const jar = await cookies();
  const actual = jar.get(COOKIE)?.value;
  const visitorId = actual && UUID_RE.test(actual) ? actual : crypto.randomUUID();
  if (visitorId !== actual) {
    jar.set(COOKIE, visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  // Insert simple: el visitante anónimo no puede leer, así que no sirve ON CONFLICT (pide política de select).
  // Si ya contó hoy, la restricción única responde 23505 y se ignora.
  const { error } = await supabase.from('landing_visits').insert({ visitor_id: visitorId });
  if (error && error.code !== '23505') return NextResponse.json({ error: 'No se pudo registrar la visita.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
