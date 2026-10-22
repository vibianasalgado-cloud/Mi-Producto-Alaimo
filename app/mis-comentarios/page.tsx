'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import '@/app/auth.css';
import LogoutButton from '../LogoutButton';
import RegistrarVisita from '../RegistrarVisita';

type Fila = {
  id: number;
  created_at: string;
  mensaje: string;
  email: string | null;
};

const fmt = (iso: string) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

export default function MisComentarios() {
  const [cuenta, setCuenta] = useState('');
  const [filas, setFilas] = useState<Fila[] | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [email, setEmail] = useState('');
  const [guardando, setGuardando] = useState(false);
  const enCurso = useRef(false); // bloquea el segundo envío al instante
  const [msg, setMsg] = useState<{ texto: string; tipo: '' | 'err' | 'ok' }>({ texto: '', tipo: '' });

  const cargar = useCallback(async () => {
    const res = await fetch('/api/mis-comentarios');
    if (res.status === 401) return window.location.assign('/login?next=/mis-comentarios');
    const j = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg({ texto: j.error || 'No se pudieron cargar tus comentarios.', tipo: 'err' });
    setCuenta(j.email);
    setFilas(j.filas);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function guardar(ev: React.FormEvent) {
    ev.preventDefault();
    if (enCurso.current) return;
    if (!mensaje.trim()) return setMsg({ texto: 'Escribe tu comentario.', tipo: 'err' });
    enCurso.current = true;
    setGuardando(true);
    setMsg({ texto: 'Guardando…', tipo: '' });
    try {
      const res = await fetch('/api/mis-comentarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje, email }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) return setMsg({ texto: j.error || 'No pudimos guardar. Intenta de nuevo.', tipo: 'err' });
      setMensaje('');
      setEmail('');
      setMsg({ texto: '¡Listo, gracias!', tipo: 'ok' });
      await cargar();
    } catch {
      setMsg({ texto: 'No se pudo conectar. Intenta de nuevo.', tipo: 'err' });
    } finally {
      enCurso.current = false;
      setGuardando(false);
    }
  }

  return (
    <div className="wrap">
      <RegistrarVisita />
      <div className="top">
        <div>
          <h1>Mis comentarios</h1>
          <span className="who">{cuenta}</span>
        </div>
        <LogoutButton />
      </div>

      <form className="card" onSubmit={guardar} noValidate>
        <h2>Déjanos un comentario</h2>
        <label htmlFor="mensaje">Tu comentario</label>
        <textarea id="mensaje" maxLength={2000} required value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
        <label htmlFor="email">
          Correo de contacto <span className="count">(opcional)</span>
        </label>
        <input
          type="email"
          id="email"
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={guardando}>
          Guardar
        </button>
        <p className={'msg' + (msg.tipo ? ' ' + msg.tipo : '')} role="status" aria-live="polite">
          {msg.texto}
        </p>
      </form>

      <section className="block">
        <div className="block-head">
          <h2>
            Mis comentarios <span className="count">{filas ? `(${filas.length})` : ''}</span>
          </h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Comentario</th>
                <th>Correo</th>
              </tr>
            </thead>
            <tbody>
              {filas && filas.length === 0 && (
                <tr>
                  <td colSpan={3} className="vacio">
                    Todavía no tienes comentarios.
                  </td>
                </tr>
              )}
              {filas?.map((r) => (
                <tr key={r.id}>
                  <td className="fecha">{fmt(r.created_at)}</td>
                  <td className="mensaje">{r.mensaje}</td>
                  <td className="mensaje">{r.email || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
