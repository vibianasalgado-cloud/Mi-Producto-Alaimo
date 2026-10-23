import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';

const COOKIE = 'vid';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

// Solo lee la cookie (sin crearla): para unir un envío con el recorrido del visitante.
export async function visitorIdActual() {
  const actual = (await cookies()).get(COOKIE)?.value;
  return actual && UUID_RE.test(actual) ? actual : null;
}

// Visitante anónimo de la landing, reconocido por una cookie aleatoria (sin datos personales).
// Devuelve null para bots y para el admin, que no se cuentan.
export async function visitante(req: Request) {
  if (BOT_RE.test(req.headers.get('user-agent') ?? '')) return null;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (isAdmin(data.user?.email)) return null;

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
  return { supabase, visitorId };
}
