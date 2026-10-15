import { createClient } from '@supabase/supabase-js';

// Solo llave pública: la seguridad la dan las políticas RLS de las tablas.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);
