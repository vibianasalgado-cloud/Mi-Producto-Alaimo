import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Una fila por usuario por día: si ya existe, no hace nada.
export async function POST() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: 'Sin sesión.' }, { status: 401 });
  const { error } = await supabase.from('visits').upsert({}, { onConflict: 'user_id,day', ignoreDuplicates: true });
  if (error) return NextResponse.json({ error: 'No se pudo registrar la visita.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
