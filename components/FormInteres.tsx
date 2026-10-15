'use client';

import { EMAIL_RE, useSubmit } from './useSubmit';

const DEFAULT_INTEREST = 'Quiero ser contactado, estoy interesado(a) en un crédito';

export default function FormInteres() {
  const { msg, busy, onSubmit } = useSubmit('/api/signups', (f) => {
    const email = (f.elements.namedItem('email') as HTMLInputElement).value.trim();
    if (!EMAIL_RE.test(email)) return { error: 'Escribe un correo válido.' };
    const mensaje = (f.elements.namedItem('mensaje') as HTMLTextAreaElement).value.trim() || DEFAULT_INTEREST;
    return { body: { email, mensaje, website: '' } };
  });

  return (
    <form className="form form-interest" id="form-interes" noValidate onSubmit={onSubmit}>
      <h3>¿Quieres que te contactemos?</h3>
      <label htmlFor="int-email">Correo</label>
      <input
        type="email"
        id="int-email"
        name="email"
        maxLength={254}
        required
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
      />
      <label htmlFor="int-mensaje">Mensaje</label>
      <textarea id="int-mensaje" name="mensaje" maxLength={500} defaultValue={DEFAULT_INTEREST} />
      <div className="hp" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        Quiero que me contacten
      </button>
      <p className={'form-msg' + (msg.kind ? ' ' + msg.kind : '')} role="status" aria-live="polite">
        {msg.text}
      </p>
    </form>
  );
}
