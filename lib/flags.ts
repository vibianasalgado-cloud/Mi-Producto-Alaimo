import 'server-only';
import { createClient } from '@/lib/supabase/server';

// Interruptores de features (tabla feature_flags). La tabla no se lee con la llave pública:
// la función feature_encendida() devuelve solo si está encendida. Se cambian desde /admin.
export const CONTACTO_RAPIDO = 'contacto_rapido_simulador';

// Si la base tarda más que esto, la feature se considera apagada: la landing no espera a Supabase.
const ESPERA_MAXIMA_MS = 1500;

// Ante cualquier error o demora se considera apagada: la app queda como sin la feature.
export async function featureEncendida(clave: string): Promise<boolean> {
  const consulta = (async () => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc('feature_encendida', { p_clave: clave });
      return !error && data === true;
    } catch {
      return false;
    }
  })();
  let reloj: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<boolean>((resolver) => {
    reloj = setTimeout(() => resolver(false), ESPERA_MAXIMA_MS);
  });
  const encendida = await Promise.race([consulta, limite]);
  clearTimeout(reloj);
  return encendida;
}
