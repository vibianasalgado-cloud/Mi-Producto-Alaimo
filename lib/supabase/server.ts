import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Cliente con la llave pública y la sesión del usuario (cookies):
// las consultas pasan por RLS. Solo se usa en el servidor.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(list) {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Component: el proxy ya refresca la sesión.
          }
        },
      },
    },
  );
}
