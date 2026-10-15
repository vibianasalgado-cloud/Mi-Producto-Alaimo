import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Cliente con llave secreta: solo se importa desde rutas de servidor.
export function supabaseServer() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('Falta SUPABASE_URL o SUPABASE_SECRET_KEY');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
