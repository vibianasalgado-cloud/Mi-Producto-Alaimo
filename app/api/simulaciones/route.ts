import { NextResponse } from 'next/server';
import { visitante } from '@/lib/visitante';

// Registra que el visitante usó el simulador hoy (una fila por visitante por día, sin montos).
export async function POST(req: Request) {
  const v = await visitante(req);
  if (!v) return NextResponse.json({ ok: true }); // bot o admin: no se cuenta

  // Igual que landing_visits: sin ON CONFLICT; si ya simuló hoy, el 23505 se ignora.
  const { error } = await v.supabase.from('simulaciones').insert({ visitor_id: v.visitorId });
  if (error && error.code !== '23505') return NextResponse.json({ error: 'No se pudo registrar la simulación.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
