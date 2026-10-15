'use client';

import { useState } from 'react';
import Link from 'next/link';
import '@/app/auth.css';

// Solo rutas internas (evita redirecciones abiertas).
function destino(porDefecto: string) {
  const next = new URLSearchParams(window.location.search).get('next');
  return next && /^\/(?![/\\])/.test(next) ? next : porDefecto;
}

export default function AuthForm({ modo }: { modo: 'login' | 'registro' }) {
  const esRegistro = modo === 'registro';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: '' | 'err' | 'ok' }>({ texto: '', tipo: '' });
  const [enviando, setEnviando] = useState(false);

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    setEnviando(true);
    setMensaje({ texto: 'Un momento…', tipo: '' });
    try {
      const res = await fetch(esRegistro ? '/api/auth/registro' : '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMensaje({ texto: j.error || 'No se pudo completar. Intenta de nuevo.', tipo: 'err' });
      } else if (j.confirmar) {
        setMensaje({ texto: 'Revisa tu correo para confirmar la cuenta y luego entra.', tipo: 'ok' });
      } else {
        // Navegación completa para que el servidor lea la sesión recién creada.
        window.location.assign(destino(j.admin ? '/admin' : '/mi-cuenta'));
        return;
      }
    } catch {
      setMensaje({ texto: 'No se pudo conectar. Intenta de nuevo.', tipo: 'err' });
    }
    setEnviando(false);
  }

  return (
    <div className="wrap">
      <form className="login" onSubmit={enviar}>
        <h1>{esRegistro ? 'Crear cuenta' : 'Entrar'}</h1>
        <label htmlFor="email">Correo</label>
        <input
          type="email"
          id="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          required
          minLength={6}
          autoComplete={esRegistro ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {esRegistro ? 'Crear cuenta' : 'Entrar'}
        </button>
        <Link className="alt" href={esRegistro ? '/login' : '/registro'}>
          {esRegistro ? 'Ya tengo cuenta' : '¿No tienes cuenta? Crear una'}
        </Link>
        <p className={'msg' + (mensaje.tipo ? ' ' + mensaje.tipo : '')} role="status" aria-live="polite">
          {mensaje.texto}
        </p>
      </form>
    </div>
  );
}
