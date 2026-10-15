'use client';

import { useEffect } from 'react';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type Armado = { error?: string; url?: string; datos?: Record<string, string> };

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

export default function LandingScripts() {
  useEffect(() => {
    const limpiar: Array<() => void> = [];

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

    limpiar.push(
      conectar('form-interes', (f) => {
        const email = valor(f, 'email').trim();
        if (!EMAIL_RE.test(email)) return { error: 'Escribe un correo válido.' };
        return { url: '/api/interes', datos: { email, mensaje: valor(f, 'mensaje').trim(), website: valor(f, 'website') } };
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
