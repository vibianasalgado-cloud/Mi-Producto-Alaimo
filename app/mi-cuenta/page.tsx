'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import '@/app/auth.css';
import LogoutButton from '../LogoutButton';

type Fila = {
  id: number;
  created_at: string;
  oferta_comercios: string;
  como_hacerlo: string | null;
  donde_comprar: string | null;
  quiere_ser_contactado: boolean;
};

const fmt = (iso: string) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

export default function MiCuenta() {
  const [email, setEmail] = useState('');
  const [filas, setFilas] = useState<Fila[] | null>(null);
  const [oferta, setOferta] = useState('');
  const [como, setComo] = useState('');
  const [donde, setDonde] = useState('');
  const [contacto, setContacto] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const enCurso = useRef(false); // el estado se actualiza tarde; esto bloquea el segundo envío al instante
  const [msg, setMsg] = useState<{ texto: string; tipo: '' | 'err' | 'ok' }>({ texto: '', tipo: '' });

  const cargar = useCallback(async () => {
    const res = await fetch('/api/interesados');
    if (res.status === 401) return window.location.assign('/login?next=/mi-cuenta');
    const j = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg({ texto: j.error || 'No se pudieron cargar tus datos.', tipo: 'err' });
    setEmail(j.email);
    setFilas(j.filas);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function guardar(ev: React.FormEvent) {
    ev.preventDefault();
    if (enCurso.current) return;
    if (!oferta.trim()) return setMsg({ texto: 'Cuéntanos qué ofrecimiento te interesa.', tipo: 'err' });
    enCurso.current = true;
    setGuardando(true);
    setMsg({ texto: 'Guardando…', tipo: '' });
    try {
      const res = await fetch('/api/interesados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oferta_comercios: oferta,
          como_hacerlo: como,
          donde_comprar: donde,
          quiere_ser_contactado: contacto,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) return setMsg({ texto: j.error || 'No pudimos guardar. Intenta de nuevo.', tipo: 'err' });
      setOferta('');
      setComo('');
      setDonde('');
      setContacto(true);
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
      <div className="top">
        <div>
          <h1>Mi cuenta</h1>
          <span className="who">{email}</span>
        </div>
        <LogoutButton />
      </div>

      <form className="card" onSubmit={guardar} noValidate>
        <h2>Cuéntanos qué financiación buscas</h2>
        <label htmlFor="oferta">¿Qué ofrecimiento de financiación en comercios te interesa?</label>
        <textarea id="oferta" maxLength={500} required value={oferta} onChange={(e) => setOferta(e.target.value)} />
        <label htmlFor="como">
          ¿Cómo te gustaría hacerlo? <span className="count">(opcional)</span>
        </label>
        <textarea id="como" maxLength={500} value={como} onChange={(e) => setComo(e.target.value)} />
        <label htmlFor="donde">
          ¿Dónde te gustaría comprar? <span className="count">(opcional)</span>
        </label>
        <input type="text" id="donde" maxLength={500} value={donde} onChange={(e) => setDonde(e.target.value)} />
        <label className="check">
          <input type="checkbox" checked={contacto} onChange={(e) => setContacto(e.target.checked)} /> Quiero ser
          contactado para obtener un crédito
        </label>
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
            Mis registros <span className="count">{filas ? `(${filas.length})` : ''}</span>
          </h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Ofrecimiento</th>
                <th>Cómo</th>
                <th>Dónde</th>
                <th>Contacto</th>
              </tr>
            </thead>
            <tbody>
              {filas && filas.length === 0 && (
                <tr>
                  <td colSpan={5} className="vacio">
                    Todavía no tienes registros.
                  </td>
                </tr>
              )}
              {filas?.map((r) => (
                <tr key={r.id}>
                  <td className="fecha">{fmt(r.created_at)}</td>
                  <td className="mensaje">{r.oferta_comercios}</td>
                  <td className="mensaje">{r.como_hacerlo || '—'}</td>
                  <td className="mensaje">{r.donde_comprar || '—'}</td>
                  <td className="mensaje">{r.quiere_ser_contactado ? 'Sí' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
