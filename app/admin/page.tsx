'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { supabaseBrowser as client } from '@/lib/supabase-browser';

type Signup = { id: number; email: string | null; mensaje: string | null; created_at: string };
type Feedback = Signup;

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

function csvCell(v: unknown) {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // evita fórmulas en Excel
  return '"' + s.replace(/"/g, '""') + '"';
}

function Table({ rows, last }: { rows: Signup[]; last: string }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Correo</th>
            <th>{last}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3} className="vacio">
                Todavía no hay registros.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id}>
                <td className="fecha">{fmt(r.created_at)}</td>
                <td className="email">{r.email || '—'}</td>
                <td className="mensaje">{r.mensaje}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [who, setWho] = useState<string | null>(null);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [msg, setMsg] = useState<{ text: string; err: boolean }>({ text: '', err: false });
  const [busy, setBusy] = useState(false);

  function showLogin(text?: string) {
    setWho(null);
    setSignups([]);
    setFeedback([]);
    if (text !== undefined) setMsg({ text, err: true });
  }

  async function loadData(email: string) {
    const [s, f] = await Promise.all([
      client.from('signups').select('*').order('created_at', { ascending: false }).limit(1000),
      client.from('feedback').select('*').order('created_at', { ascending: false }).limit(1000),
    ]);
    if (s.error || f.error) {
      showLogin('No se pudieron cargar los datos. Intenta entrar de nuevo.');
      await client.auth.signOut();
      return;
    }
    setSignups(s.data as Signup[]);
    setFeedback(f.data as Feedback[]);
    setWho(email);
  }

  useEffect(() => {
    client.auth.getSession().then(
      async (res) => {
        const session = res.data.session;
        if (session) await loadData(session.user.email ?? '');
        setReady(true);
      },
      () => setReady(true),
    );
  }, []);

  async function onLogin(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const pwd = form.elements.namedItem('password') as HTMLInputElement;
    setBusy(true);
    setMsg({ text: 'Entrando…', err: false });
    try {
      const res = await client.auth.signInWithPassword({ email, password: pwd.value });
      if (res.error || !res.data.session) {
        showLogin('Correo o contraseña incorrectos.');
      } else {
        pwd.value = '';
        setMsg({ text: '', err: false });
        await loadData(res.data.session.user.email ?? '');
      }
    } catch {
      showLogin('No se pudo conectar. Intenta de nuevo.');
    }
    setBusy(false);
  }

  async function onLogout() {
    await client.auth.signOut();
    showLogin();
    setMsg({ text: '', err: false });
  }

  function downloadCsv() {
    const lines = [['id', 'correo', 'mensaje', 'fecha'].map(csvCell).join(',')];
    signups.forEach((r) => {
      lines.push([r.id, r.email, r.mensaje, r.created_at].map(csvCell).join(','));
    });
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'signups.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <div className="wrap">
      <form className="login" id="login" hidden={!ready || who !== null} onSubmit={onLogin}>
        <h1>Admin</h1>
        <label htmlFor="email">Correo</label>
        <input type="email" id="email" name="email" required autoComplete="username" />
        <label htmlFor="password">Contraseña</label>
        <input type="password" id="password" name="password" required autoComplete="current-password" />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          Entrar
        </button>
        <p className={'msg' + (msg.err ? ' err' : '')} id="login-msg" role="status" aria-live="polite">
          {msg.text}
        </p>
      </form>

      <div id="panel" hidden={who === null}>
        <div className="top">
          <div>
            <h1>Admin</h1>
            <span className="who">{who}</span>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>

        <section className="block">
          <div className="block-head">
            <h2>
              Signups <span className="count">({signups.length})</span>
            </h2>
            <button type="button" className="btn btn-primary" onClick={downloadCsv}>
              Descargar CSV
            </button>
          </div>
          <Table rows={signups} last="Mensaje" />
        </section>

        <section className="block">
          <div className="block-head">
            <h2>
              Feedback <span className="count">({feedback.length})</span>
            </h2>
          </div>
          <Table rows={feedback} last="Comentario" />
        </section>
      </div>
    </div>
  );
}
