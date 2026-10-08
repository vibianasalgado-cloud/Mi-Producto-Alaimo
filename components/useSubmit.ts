'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type Built = { error: string } | { body: Record<string, unknown> };

export function useSubmit(endpoint: string, build: (form: HTMLFormElement) => Built) {
  const [msg, setMsg] = useState<{ text: string; kind: '' | 'ok' | 'err' }>({ text: '', kind: '' });
  const [busy, setBusy] = useState(false);

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    if ((form.elements.namedItem('website') as HTMLInputElement).value) return; // honeypot
    const built = build(form);
    if ('error' in built) {
      setMsg({ text: built.error, kind: 'err' });
      return;
    }
    setBusy(true);
    setMsg({ text: 'Enviando…', kind: '' });
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(built.body),
      });
      if (!res.ok) {
        setMsg({ text: 'No pudimos enviar tu mensaje. Intenta de nuevo.', kind: 'err' });
      } else {
        setMsg({ text: '¡Listo, gracias! Recibimos tu mensaje.', kind: 'ok' });
        form.reset();
      }
    } catch {
      setMsg({ text: 'No pudimos enviar tu mensaje. Revisa tu conexión e intenta de nuevo.', kind: 'err' });
    }
    setBusy(false);
  }

  return { msg, busy, onSubmit };
}
