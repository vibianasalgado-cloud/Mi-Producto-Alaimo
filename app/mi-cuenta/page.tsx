'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import '@/app/auth.css';
import LogoutButton from '../LogoutButton';
import RegistrarVisita from '../RegistrarVisita';

type Fila = {
  id: number;
  created_at: string;
  oferta_comercios: string;
  como_hacerlo: string | null;
  donde_comprar: string | null;
  quiere_ser_contactado: boolean;
  canal_contacto: string | null;
};

const CANALES: Record<string, string> = { whatsapp: 'WhatsApp', llamada: 'Llamada', correo: 'Correo' };

const fmt = (iso: string) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

export default function MiCuenta() {
  const [email, setEmail] = useState('');
  const [filas, setFilas] = useState<Fila[] | null>(null);
  const [oferta, setOferta] = useState('');
  const [como, setComo] = useState('');
  const [donde, setDonde] = useState('');
  const [canal, setCanal] = useState('');
  const [contacto, setContacto] = useState(true);
  const [editando, setEditando] = useState<number | null>(null); // id del registro que se edita
  const [guardando, setGuardando] = useState(false);
  const ofertaRef = useRef<HTMLTextAreaElement>(null);
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

  function limpiar() {
    setOferta('');
    setComo('');
    setDonde('');
    setCanal('');
    setContacto(true);
    setEditando(null);
  }

  function editar(r: Fila) {
    setOferta(r.oferta_comercios);
    setComo(r.como_hacerlo ?? '');
    setDonde(r.donde_comprar ?? '');
    setContacto(r.quiere_ser_contactado);
    setCanal(r.quiere_ser_contactado ? r.canal_contacto ?? '' : '');
    setEditando(r.id);
    setMsg({ texto: '', tipo: '' });
    ofertaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    ofertaRef.current?.focus({ preventScroll: true });
  }

  function cancelar() {
    limpiar();
    setMsg({ texto: '', tipo: '' });
  }

  function cambiarContacto(v: boolean) {
    setContacto(v);
    if (!v) setCanal(''); // sin permiso de contacto no hay canal
  }

  async function guardar(ev: React.FormEvent) {
    ev.preventDefault();
    if (enCurso.current) return;
    if (!oferta.trim()) return setMsg({ texto: 'Cuéntanos qué ofrecimiento te interesa.', tipo: 'err' });
    enCurso.current = true;
    setGuardando(true);
    setMsg({ texto: 'Guardando…', tipo: '' });
    try {
      const res = await fetch('/api/interesados', {
        method: editando === null ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editando === null ? {} : { id: editando }),
          oferta_comercios: oferta,
          como_hacerlo: como,
          donde_comprar: donde,
          quiere_ser_contactado: contacto,
          canal_contacto: contacto ? canal : '',
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) return setMsg({ texto: j.error || 'No pudimos guardar. Intenta de nuevo.', tipo: 'err' });
      const eraEdicion = editando !== null;
      limpiar();
      setMsg({ texto: eraEdicion ? 'Cambios guardados.' : '¡Listo, gracias!', tipo: 'ok' });
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
          <h1>Mi cuenta</h1>
          <span className="who">{email}</span>
        </div>
        <LogoutButton />
      </div>

      <form className="card" onSubmit={guardar} noValidate>
        <h2>{editando === null ? 'Cuéntanos qué financiación buscas' : 'Editar registro'}</h2>
        <label htmlFor="oferta">¿Qué ofrecimiento de financiación en comercios te interesa?</label>
        <textarea ref={ofertaRef} id="oferta" maxLength={500} required value={oferta} onChange={(e) => setOferta(e.target.value)} />
        <label htmlFor="como">
          ¿Cómo te gustaría hacerlo? <span className="count">(opcional)</span>
        </label>
        <textarea id="como" maxLength={500} value={como} onChange={(e) => setComo(e.target.value)} />
        <label htmlFor="donde">
          ¿Dónde te gustaría comprar? <span className="count">(opcional)</span>
        </label>
        <input type="text" id="donde" maxLength={500} value={donde} onChange={(e) => setDonde(e.target.value)} />
        <label htmlFor="canal">
          ¿Cómo prefieres que te contactemos? <span className="count">(opcional)</span>
        </label>
        <select
          id="canal"
          value={canal}
          disabled={!contacto}
          aria-describedby={contacto ? undefined : 'canal-ayuda'}
          onChange={(e) => setCanal(e.target.value)}
        >
          <option value="">Sin preferencia</option>
          {Object.entries(CANALES).map(([valor, nombre]) => (
            <option key={valor} value={valor}>
              {nombre}
            </option>
          ))}
        </select>
        {!contacto && (
          <span id="canal-ayuda" className="count">
            Marca &quot;Quiero ser contactado&quot; para elegir cómo contactarte.
          </span>
        )}
        <label className="check">
          <input type="checkbox" checked={contacto} onChange={(e) => cambiarContacto(e.target.checked)} /> Quiero
          ser contactado para obtener un crédito
        </label>
        <button type="submit" className="btn btn-primary" disabled={guardando}>
          {editando === null ? 'Guardar' : 'Guardar cambios'}
        </button>
        {editando !== null && (
          <button type="button" className="btn btn-ghost" onClick={cancelar} disabled={guardando}>
            Cancelar
          </button>
        )}
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
                <th>Canal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filas && filas.length === 0 && (
                <tr>
                  <td colSpan={7} className="vacio">
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
                  <td className="mensaje">{(r.canal_contacto && CANALES[r.canal_contacto]) || '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => editar(r)}
                      disabled={guardando}
                      aria-label={`Editar el registro del ${fmt(r.created_at)}`}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
