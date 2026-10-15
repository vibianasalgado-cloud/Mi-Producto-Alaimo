import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Llave secreta: salta RLS. Importar SOLO desde app/api/admin/**.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
