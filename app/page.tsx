import { readFileSync } from 'node:fs';
import path from 'node:path';
import { connection } from 'next/server';
import './landing.css';
import LandingScripts from './LandingScripts';
import { CONTACTO_RAPIDO, featureEncendida } from '@/lib/flags';

// El marcado de la landing vive en _landing/body.html (diseño original, sin cambios).
const leer = (archivo: string) => readFileSync(path.join(process.cwd(), 'app', '_landing', archivo), 'utf8');
const html = leer('body.html');
const contactoRapido = leer('contacto-rapido.html');

// Experimento "contacto rápido" (product/hypotheses/contacto-rapido-simulador.md):
// con el interruptor encendido, el formulario corto entra en la tarjeta del simulador
// y el botón que baja al formulario completo pasa a ser un enlace secundario.
const MARCADOR = '<!-- contacto-rapido -->';
const BOTON = 'class="btn btn-primary" href="#form-interes" id="sim-contacto">Quiero que me contacten con esta simulación';
const ENLACE = 'class="sim-contacto-link" href="#form-interes" id="sim-contacto">¿Prefieres dejar todos tus datos? Usa el formulario completo';
const htmlConContactoRapido = html.replace(MARCADOR, contactoRapido).replace(BOTON, ENLACE);
// Si alguien cambia el marcador o el botón en body.html, el reemplazo dejaría de aplicar sin error: se avisa al arrancar.
if (!html.includes(MARCADOR) || !html.includes(BOTON))
  console.warn('[contacto-rapido] body.html cambió: no se encontró el marcador o el botón del simulador.');

export default async function Home() {
  // El interruptor se lee en cada visita: al cambiarlo en /admin, la landing cambia al refrescar.
  await connection();
  const encendido = await featureEncendida(CONTACTO_RAPIDO);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: encendido ? htmlConContactoRapido : html }} />
      <LandingScripts />
    </>
  );
}
