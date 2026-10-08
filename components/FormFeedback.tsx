'use client';

import { EMAIL_RE, useSubmit } from './useSubmit';

export default function FormFeedback() {
  const { msg, busy, onSubmit } = useSubmit('/api/feedback', (f) => {
    const mensaje = (f.elements.namedItem('mensaje') as HTMLTextAreaElement).value.trim();
    const email = (f.elements.namedItem('email') as HTMLInputElement).value.trim();
    if (!mensaje) return { error: 'Escribe tu comentario.' };
    if (email && !EMAIL_RE.test(email))
      return { error: 'El correo no parece válido. Corrígelo o déjalo vacío.' };
    return { body: { mensaje, email: email || null, website: '' } };
  });

  return (
    <form className="form" id="form-feedback" noValidate onSubmit={onSubmit}>
      <label htmlFor="fb-mensaje">Comentario</label>
      <textarea
        id="fb-mensaje"
        name="mensaje"
        maxLength={2000}
        required
        placeholder="¿Qué te quedó claro? ¿Qué no entendiste?"
      />
      <label htmlFor="fb-email">
        Correo <span className="opt">(opcional, por si quieres que te respondamos)</span>
      </label>
      <input
        type="email"
        id="fb-email"
        name="email"
        maxLength={254}
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
      />
      <div className="hp" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        Enviar comentario
      </button>
      <p className={'form-msg' + (msg.kind ? ' ' + msg.kind : '')} role="status" aria-live="polite">
        {msg.text}
      </p>
    </form>
  );
}
