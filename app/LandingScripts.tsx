'use client';

import { useEffect } from 'react';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type Armado = { error?: string; url?: string; datos?: Record<string, unknown> };

function conectar(formId: string, armar: (f: HTMLFormElement) => Armado): () => void {
  const form = document.getElementById(formId) as HTMLFormElement | null;
  if (!form) return () => {};
  const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
  const msg = form.querySelector('.form-msg') as HTMLElement;
  const decir = (texto: string, tipo?: string) => {
    msg.textContent = texto;
    msg.className = 'form-msg' + (tipo ? ' ' + tipo : '');
  };

  async function enviar(ev: Event) {
    ev.preventDefault();
    const armado = armar(form!);
    if (armado.error) return decir(armado.error, 'err');
    btn.disabled = true;
    decir('Enviando…');
    try {
      const res = await fetch(armado.url!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(armado.datos),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        decir(j.error || 'No pudimos enviar tu mensaje. Intenta de nuevo.', 'err');
      } else {
        decir('¡Listo, gracias! Recibimos tu mensaje.', 'ok');
        form!.reset();
      }
    } catch {
      decir('No pudimos enviar tu mensaje. Revisa tu conexión e intenta de nuevo.', 'err');
    }
    btn.disabled = false;
  }

  form.addEventListener('submit', enviar);
  return () => form.removeEventListener('submit', enviar);
}

const valor = (f: HTMLFormElement, n: string) => (f.elements.namedItem(n) as HTMLInputElement).value;

// Simulador: tasa de ejemplo, no la real (REVISAR con Legal/Producto)
const TASA_MENSUAL = 0.02;
const MONTO_MIN = 300000;
const MONTO_MAX = 5000000;
const pesos = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
// Cuota fija (sistema francés)
const cuotaMensual = (monto: number, cuotas: number) => (monto * TASA_MENSUAL) / (1 - Math.pow(1 + TASA_MENSUAL, -cuotas));

type Simulacion = { monto: number; cuotas: number };

const resumenSim = (s: Simulacion) => `${pesos(s.monto)} en ${s.cuotas} cuotas`;
// La frase que el simulador pone en el mensaje; se reescribe o se quita para que el texto coincida con lo que se envía
const FRASE_SIM = /\s*Simulé \$[\d.]+ en \d+ cuotas\./;
const conSimulacion = (texto: string, s: Simulacion | null) => {
  const frase = s ? ` Simulé ${resumenSim(s)}.` : '';
  return FRASE_SIM.test(texto) ? texto.replace(FRASE_SIM, frase).trim() : texto;
};

export default function LandingScripts() {
  useEffect(() => {
    const limpiar: Array<() => void> = [];

    // Cuenta la visita de hoy (un visitante = una fila por día)
    fetch('/api/visitas-landing', { method: 'POST' }).catch(() => {});

    // Tema claro/oscuro
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      const sync = () => {
        const oscuro = document.documentElement.getAttribute('data-theme') === 'dark';
        btn.setAttribute('aria-pressed', String(oscuro));
        btn.setAttribute('aria-label', oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
      };
      const alternar = () => {
        const actual = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const siguiente = actual === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', siguiente);
        try {
          localStorage.setItem('nequi-theme', siguiente);
        } catch {}
        sync();
      };
      sync();
      btn.addEventListener('click', alternar);
      limpiar.push(() => btn.removeEventListener('click', alternar));
    }

    // Simulador de crédito
    let adjunta: Simulacion | null = null;
    const sim = document.getElementById('form-simulador') as HTMLFormElement | null;
    const formInteres = document.getElementById('form-interes') as HTMLFormElement | null;
    if (sim && formInteres) {
      const rango = sim.elements.namedItem('monto') as HTMLInputElement;
      const montoCampo = document.getElementById('sim-monto-valor') as HTMLInputElement;
      const avisoMonto = document.getElementById('sim-monto-aviso')!;
      const cuotaTxt = document.getElementById('sim-cuota')!;
      const totalTxt = document.getElementById('sim-total')!;
      const contacto = document.getElementById('sim-contacto')!;
      const caja = document.getElementById('sim-adjunta')!;
      const cajaTxt = document.getElementById('sim-adjunta-texto')!;
      const quitar = document.getElementById('sim-quitar')!;
      const mensaje = formInteres.elements.namedItem('mensaje') as HTMLTextAreaElement;
      let contada = false;
      let mensajeGenerado: string | null = null; // el texto que puso el simulador, para no pisar lo que escriba la persona

      // El monto se elige con el deslizador (pasos de $50.000) o escribiéndolo en el campo (cualquier valor del rango)
      let monto = Number(rango.value);
      const actual = (): Simulacion => ({ monto, cuotas: Number(valor(sim, 'cuotas')) });
      const pintar = (conCampo = true) => {
        const { cuotas } = actual();
        const cuota = Math.round(cuotaMensual(monto, cuotas));
        if (conCampo) montoCampo.value = pesos(monto);
        cuotaTxt.textContent = pesos(cuota);
        totalTxt.textContent = pesos(cuota * cuotas);
      };
      // Se cuenta una vez por carga de página: al mover el simulador o al pedir contacto con el valor inicial
      const registrar = () => {
        if (contada) return;
        contada = true;
        fetch('/api/simulaciones', { method: 'POST' }).catch(() => {});
      };
      // Muestra la simulación adjunta y, si la persona no escribió su propio mensaje, lo actualiza;
      // si lo editó, solo cambia la frase "Simulé …" para que no contradiga el monto enviado
      const mostrarAdjunta = (s: Simulacion) => {
        cajaTxt.textContent = `Simulación adjunta: ${resumenSim(s)}`;
        caja.hidden = false;
        if (mensaje.value === mensaje.defaultValue || mensaje.value === mensajeGenerado) {
          mensajeGenerado = `Quiero ser contactado. Simulé ${resumenSim(s)}.`;
          mensaje.value = mensajeGenerado;
        } else {
          mensaje.value = conSimulacion(mensaje.value, s);
        }
      };
      const aplicar = (conCampo = true) => {
        pintar(conCampo);
        registrar();
        if (adjunta) {
          adjunta = actual(); // lo que se envía es lo último que la persona ve
          mostrarAdjunta(adjunta);
        }
      };
      // Pesos enteros: se ignoran los centavos ("1.000.000,00" o "1000000.5") y luego todo lo que no sea dígito
      const leerCampo = () =>
        Number(
          montoCampo.value
            .split(',')[0]
            .replace(/\.\d{1,2}\s*$/, '')
            .replace(/\D/g, ''),
        );
      const avisar = (texto: string, error = false) => {
        avisoMonto.textContent = texto;
        avisoMonto.hidden = !texto;
        avisoMonto.classList.toggle('err', error);
        montoCampo.setAttribute('aria-invalid', String(error));
      };
      const fueraDeRango = `Escribe un valor entre ${pesos(MONTO_MIN)} y ${pesos(MONTO_MAX)}.`;
      const alCambiar = (ev: Event) => {
        if (ev.target === montoCampo) {
          // Mientras escribe no se reformatea el campo; solo se recalcula si el valor ya está en el rango
          const n = leerCampo();
          if (n < MONTO_MIN || n > MONTO_MAX) return avisar(fueraDeRango, true);
          avisar('');
          monto = n;
          rango.value = String(n);
          return aplicar(false);
        }
        if (ev.target === rango) {
          monto = Number(rango.value);
          avisar('');
        }
        aplicar();
      };
      // Al salir del campo (o con Enter) el valor se ajusta al rango, se muestra con formato y se avisa si cambió
      const normalizarCampo = () => {
        const n = leerCampo();
        monto = n ? Math.min(MONTO_MAX, Math.max(MONTO_MIN, n)) : monto;
        avisar(n && n !== monto ? `Ajustamos el valor al ${n > MONTO_MAX ? 'máximo' : 'mínimo'}: ${pesos(monto)}.` : '');
        rango.value = String(monto);
        aplicar();
      };
      const adjuntar = (ev: Event) => {
        ev.preventDefault();
        registrar();
        adjunta = actual();
        mostrarAdjunta(adjunta);
        formInteres.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (formInteres.elements.namedItem('nombre_completo') as HTMLInputElement).focus({ preventScroll: true });
      };
      const soltar = () => {
        adjunta = null;
        caja.hidden = true;
        mensaje.value = mensaje.value === mensajeGenerado ? mensaje.defaultValue : conSimulacion(mensaje.value, null);
        mensajeGenerado = null;
      };

      const noEnviar = (ev: Event) => {
        ev.preventDefault();
        if (document.activeElement === montoCampo) normalizarCampo();
      };

      pintar();
      sim.addEventListener('input', alCambiar);
      sim.addEventListener('submit', noEnviar);
      montoCampo.addEventListener('change', normalizarCampo);
      contacto.addEventListener('click', adjuntar);
      quitar.addEventListener('click', soltar);
      formInteres.addEventListener('reset', soltar); // al enviar con éxito, conectar() hace reset
      limpiar.push(() => {
        sim.removeEventListener('input', alCambiar);
        sim.removeEventListener('submit', noEnviar);
        montoCampo.removeEventListener('change', normalizarCampo);
        contacto.removeEventListener('click', adjuntar);
        quitar.removeEventListener('click', soltar);
        formInteres.removeEventListener('reset', soltar);
      });
    }

    // Teclado según el documento: numérico para CC y PPT; con letras para CE y pasaporte
    const tipoDoc = document.getElementById('int-tipo-doc') as HTMLSelectElement | null;
    const numDoc = document.getElementById('int-num-doc') as HTMLInputElement | null;
    if (tipoDoc && numDoc) {
      const ajustarTeclado = () => {
        const soloNumeros = tipoDoc.value === 'CC' || tipoDoc.value === 'PPT';
        numDoc.inputMode = soloNumeros ? 'numeric' : 'text';
        numDoc.autocapitalize = soloNumeros ? 'off' : 'characters';
      };
      tipoDoc.addEventListener('change', ajustarTeclado);
      limpiar.push(() => tipoDoc.removeEventListener('change', ajustarTeclado));
    }

    limpiar.push(
      conectar('form-interes', (f) => {
        const nombre = valor(f, 'nombre_completo').trim().replace(/\s+/g, ' ');
        const tipo = valor(f, 'tipo_documento');
        const numero = valor(f, 'numero_documento').replace(/[\s.-]/g, '');
        const email = valor(f, 'email').trim();
        const autoriza = (f.elements.namedItem('autoriza_datos') as HTMLInputElement).checked;
        if ([...nombre].length < 3) return { error: 'Escribe tus nombres y apellidos completos.' };
        if (!tipo) return { error: 'Elige tu tipo de documento.' };
        if (tipo === 'CC' || tipo === 'PPT' ? !/^[0-9]{5,10}$/.test(numero) : !/^[A-Za-z0-9]{5,12}$/.test(numero))
          return {
            error:
              tipo === 'CC' || tipo === 'PPT'
                ? 'El número de documento debe tener entre 5 y 10 dígitos.'
                : 'El número de documento debe tener entre 5 y 12 letras o números.',
          };
        if (!EMAIL_RE.test(email)) return { error: 'Escribe un correo válido.' };
        if (!autoriza) return { error: 'Para contactarte necesitamos tu autorización de tratamiento de datos.' };
        const datos: Record<string, unknown> = {
          nombre_completo: nombre,
          tipo_documento: tipo,
          numero_documento: numero,
          email,
          // Si el navegador restauró un mensaje con "Simulé …" sin simulación adjunta, la frase se ajusta a lo que se envía
          mensaje: conSimulacion(valor(f, 'mensaje').trim(), adjunta),
          autoriza_datos: true,
          website: valor(f, 'website'),
        };
        if (adjunta) {
          datos.simulacion_monto = adjunta.monto;
          datos.simulacion_cuotas = adjunta.cuotas;
        }
        return { url: '/api/interes', datos };
      }),
      conectar('form-feedback', (f) => {
        const mensaje = valor(f, 'mensaje').trim();
        const email = valor(f, 'email').trim();
        if (!mensaje) return { error: 'Escribe tu comentario.' };
        if (email && !EMAIL_RE.test(email)) return { error: 'El correo no parece válido. Corrígelo o déjalo vacío.' };
        return { url: '/api/feedback', datos: { mensaje, email, website: valor(f, 'website') } };
      }),
    );

    return () => limpiar.forEach((fn) => fn());
  }, []);

  return null;
}
