'use client';

import { useEffect, useState } from 'react';
import '@/app/auth.css';
import Link from 'next/link';
import LogoutButton from '../LogoutButton';
import RegistrarVisita from '../RegistrarVisita';

type Base = { id: number; created_at: string; email: string | null };
type Signup = Base & { mensaje: string | null };
type Feedback = Base & { mensaje: string };
type Interesado = Base & {
  oferta_comercios: string;
  como_hacerlo: string | null;
  donde_comprar: string | null;
  quiere_ser_contactado: boolean;
};
type Datos = { email: string; signups: Signup[]; feedback: Feedback[]; interesados: Interesado[] };

const fmt = (iso: string) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

function csvCell(v: unknown) {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // evita fórmulas en Excel
  return '"' + s.replace(/"/g, '""') + '"';
}

function descargarCsv(filas: Signup[]) {
  const lineas = [['id', 'correo', 'mensaje', 'fecha'].map(csvCell).join(',')];
  filas.forEach((r) => lineas.push([r.id, r.email, r.mensaje, r.created_at].map(csvCell).join(',')));
  const blob = new Blob(['﻿' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'signups.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function Vacio({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="vacio">
        Todavía no hay registros.
      </td>
    </tr>
  );
}

export default function Admin() {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/datos');
      if (res.status === 401) return window.location.assign('/login?next=/admin');
      if (res.status === 403) return window.location.assign('/mi-cuenta');
      const j = await res.json().catch(() => ({}));
      if (!res.ok) return setError(j.error || 'No se pudieron cargar los datos.');
      setDatos(j);
    })();
  }, []);

  const quierenContacto = datos?.interesados.filter((r) => r.quiere_ser_contactado).length ?? 0;

  return (
    <div className="wrap">
      <RegistrarVisita />
      <div className="top">
        <div>
          <h1>Admin</h1>
          <span className="who">{datos?.email}</span>
        </div>
        <Link href="/admin/metricas" className="btn btn-primary">
          Ver métricas
        </Link>
        <LogoutButton />
      </div>
      {error && <p className="msg err">{error}</p>}

      {datos && (
        <>
          <section className="block">
            <div className="block-head">
              <h2>
                Signups <span className="count">({datos.signups.length})</span>
              </h2>
              <button type="button" className="btn btn-primary" onClick={() => descargarCsv(datos.signups)}>
                Descargar CSV
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Correo</th>
                    <th>Mensaje</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.signups.length === 0 && <Vacio cols={3} />}
                  {datos.signups.map((r) => (
                    <tr key={r.id}>
                      <td className="fecha">{fmt(r.created_at)}</td>
                      <td>{r.email || '—'}</td>
                      <td className="mensaje">{r.mensaje}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="block">
            <div className="block-head">
              <h2>
                Interesados <span className="count">({datos.interesados.length})</span>
              </h2>
              <span className="count">
                {quierenContacto} de {datos.interesados.length} quieren ser contactados
              </span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Correo</th>
                    <th>Ofrecimiento</th>
                    <th>Cómo</th>
                    <th>Dónde</th>
                    <th>Contacto</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.interesados.length === 0 && <Vacio cols={6} />}
                  {datos.interesados.map((r) => (
                    <tr key={r.id}>
                      <td className="fecha">{fmt(r.created_at)}</td>
                      <td>{r.email || '—'}</td>
                      <td className="mensaje">{r.oferta_comercios}</td>
                      <td className="mensaje">{r.como_hacerlo || '—'}</td>
                      <td className="mensaje">{r.donde_comprar || '—'}</td>
                      <td>{r.quiere_ser_contactado ? 'Sí' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="block">
            <div className="block-head">
              <h2>
                Feedback <span className="count">({datos.feedback.length})</span>
              </h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Correo</th>
                    <th>Comentario</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.feedback.length === 0 && <Vacio cols={3} />}
                  {datos.feedback.map((r) => (
                    <tr key={r.id}>
                      <td className="fecha">{fmt(r.created_at)}</td>
                      <td>{r.email || '—'}</td>
                      <td className="mensaje">{r.mensaje}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
