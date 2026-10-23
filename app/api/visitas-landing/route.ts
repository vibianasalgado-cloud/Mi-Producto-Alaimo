import { NextResponse } from 'next/server';
import { visitante } from '@/lib/visitante';

// Una fila por visitante por día.
export async function POST(req: Request) {
  const v = await visitante(req);
  if (!v) return NextResponse.json({ ok: true }); // bot o admin: no se cuenta

  // Insert simple: el visitante anónimo no puede leer, así que no sirve ON CONFLICT (pide política de select).
  // Si ya contó hoy, la restricción única responde 23505 y se ignora.
  const { error } = await v.supabase.from('landing_visits').insert({ visitor_id: v.visitorId });
  if (error && error.code !== '23505') return NextResponse.json({ error: 'No se pudo registrar la visita.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
