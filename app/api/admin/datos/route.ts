import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/admin';

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: 'Sin sesión.' }, { status: 401 });
  if (!isAdmin(data.user.email)) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });

  const admin = createAdminClient();
  const pedir = (tabla: string) => admin.from(tabla).select('*').order('created_at', { ascending: false }).limit(1000);
  const [signups, feedback, interesados] = await Promise.all([pedir('signups'), pedir('feedback'), pedir('interesados')]);
  if (signups.error || feedback.error || interesados.error)
    return NextResponse.json({ error: 'No se pudieron cargar los datos.' }, { status: 500 });
  return NextResponse.json({
    email: data.user.email,
    signups: signups.data,
    feedback: feedback.data,
    interesados: interesados.data,
  });
}
