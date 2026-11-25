'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import '@/app/auth.css';
import LogoutButton from '../../LogoutButton';
import RegistrarVisita from '../../RegistrarVisita';

type Semana = { semana: string; nuevos: number; activos: number };
type Metricas = {
  email: string;
  usuarios: number;
  activacion: { n: number; pct: number };
  retorno: { n: number; pct: number };
  contacto: { n: number; pct: number };
  contactoDeInteresados: { n: number; de: number; pct: number };
  intencion: { n: number; de: number; pct: number };
  landing: {
    visitantes: number;
    desde: string | null;
    interesados: number;
    pct: number;
    pctContacto: number;
    dejaronDatos: number;
    pctDatos: number;
    envios: number;
    personas: number;
  };
  simulador: {
    visitantes: number;
    desde: string | null;
    pct: number;
    dejaronDatos: number;
    pctDatos: number;
    contactos: number;
    montoPromedio: number;
    cuotasPromedio: number;
  };
  experimento: {
    encendida: boolean;
    desde: string | null;
    hasta: string | null;
    simularon: number;
    dejaronDatos: number;
    pct: number;
    corto: number;
    largo: number;
    enviosCortos: number;
    base: { simularon: number; dejaronDatos: number; pct: number; hasta: string | null };
    muestraMinima: number;
    diasEncendido: number;
    regla: 'parar' | 'iterar' | 'avanzar' | null;
    decision: 'sin_iniciar' | 'sin_datos' | 'sin_linea_base' | 'muestra_insuficiente' | 'parar' | 'iterar' | 'avanzar';
  };
  semanas: Semana[];
};

const DECISION: Record<Metricas['experimento']['decision'], string> = {
  sin_iniciar: 'Aún no se ha encendido',
  sin_datos: 'Sin simulaciones desde que se encendió',
  sin_linea_base: 'Sin línea base',
  muestra_insuficiente: 'Muestra insuficiente',
  parar: 'Parar',
  iterar: 'Iterar',
  avanzar: 'Avanzar al nivel 2',
};
const REGLA = { parar: 'parar', iterar: 'iterar', avanzar: 'avanzar' } as const;
const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' });

const pct = (n: number) => n.toLocaleString('es-CO', { maximumFractionDigits: 1 }) + ' %';
const dia = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });

function Grafico({ semanas }: { semanas: Semana[] }) {
  const W = 720;
  const H = 260;
  const m = { t: 12, r: 8, b: 32, l: 32 };
  const max = Math.max(1, ...semanas.flatMap((s) => [s.nuevos, s.activos]));
  const tope = Math.max(4, Math.ceil(max / 4) * 4); // eje con 4 divisiones enteras
  const alto = H - m.t - m.b;
  const ancho = W - m.l - m.r;
  const paso = ancho / semanas.length;
  const barra = Math.min(26, paso / 2 - 4);
  const y = (v: number) => m.t + alto - (v / tope) * alto;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Usuarios nuevos y usuarios que entraron, por semana">
      {[0, 1, 2, 3, 4].map((i) => {
        const v = (tope / 4) * i;
        return (
          <g key={i}>
            <line className="grid" x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} />
            <text x={m.l - 6} y={y(v) + 4} textAnchor="end">
              {v}
            </text>
          </g>
        );
      })}
      {semanas.map((s, i) => {
        const cx = m.l + paso * i + paso / 2;
        return (
          <g key={s.semana}>
            <rect className="bar-nuevos" x={cx - barra - 1} y={y(s.nuevos)} width={barra} height={m.t + alto - y(s.nuevos)} rx={3}>
              <title>{`Semana del ${dia(s.semana)}: ${s.nuevos} nuevos`}</title>
            </rect>
            <rect className="bar-activos" x={cx + 1} y={y(s.activos)} width={barra} height={m.t + alto - y(s.activos)} rx={3}>
              <title>{`Semana del ${dia(s.semana)}: ${s.activos} entraron`}</title>
            </rect>
            <text x={cx} y={H - 10} textAnchor="middle">
              {dia(s.semana)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function MetricasAdmin() {
  const [datos, setDatos] = useState<Metricas | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/metricas');
      if (res.status === 401) return window.location.assign('/login?next=/admin/metricas');
      if (res.status === 403) return window.location.assign('/mi-cuenta');
      const j = await res.json().catch(() => ({}));
      if (!res.ok) return setError(j.error || 'No se pudieron cargar las métricas.');
      setDatos(j);
    })();
  }, []);

  return (
    <div className="wrap">
      <RegistrarVisita />
      <div className="top">
        <div>
          <h1>Métricas</h1>
          <span className="who">{datos?.email}</span>
        </div>
        <Link href="/admin" className="btn btn-ghost">
          Volver al panel
        </Link>
        <LogoutButton />
      </div>
      {error && <p className="msg err">{error}</p>}

      {datos && (
        <>
          <div className="stats">
            <div className="stat">
              <div className="label">Usuarios registrados</div>
              <div className="value">{datos.usuarios}</div>
            </div>
            <div className="stat">
              <div className="label">Activación</div>
              <div className="value">{pct(datos.activacion.pct)}</div>
              <div className="sub">
                {datos.activacion.n} de {datos.usuarios} dejaron al menos un registro de interés en crédito
              </div>
            </div>
            <div className="stat">
              <div className="label">Retorno</div>
              <div className="value">{pct(datos.retorno.pct)}</div>
              <div className="sub">
                {datos.retorno.n} de {datos.usuarios} entraron en al menos dos días distintos
              </div>
            </div>
          </div>

          <section className="block">
            <div className="block-head">
              <h2>Interés y contacto</h2>
              <span className="count">Lo que queremos probar</span>
            </div>
            <div className="stats">
              <div className="stat">
                <div className="label">Quieren ser contactados</div>
                <div className="value">{pct(datos.contacto.pct)}</div>
                <div className="sub">
                  {datos.contacto.n} de {datos.usuarios} usuarios pidieron que los contacten
                </div>
              </div>
              <div className="stat">
                <div className="label">Contacto entre quienes dejaron datos</div>
                <div className="value">{pct(datos.contactoDeInteresados.pct)}</div>
                <div className="sub">
                  {datos.contactoDeInteresados.n} de {datos.contactoDeInteresados.de} que dejaron un registro
                </div>
              </div>
              <div className="stat">
                <div className="label">Intención concreta</div>
                <div className="value">{pct(datos.intencion.pct)}</div>
                <div className="sub">
                  {datos.intencion.n} de {datos.intencion.de} solicitudes de contacto dicen cómo o dónde comprarían
                </div>
              </div>
            </div>
          </section>

          <section className="block">
            <div className="block-head">
              <h2>Landing</h2>
              <span className="count">
                {datos.landing.desde ? `Visitas contadas desde el ${dia(datos.landing.desde)}` : 'Aún sin visitas contadas'}
              </span>
            </div>
            <div className="stats">
              <div className="stat">
                <div className="label">Visitantes de la landing</div>
                <div className="value">{datos.landing.visitantes}</div>
                <div className="sub">Visitantes únicos (sin contar al admin)</div>
              </div>
              <div className="stat">
                <div className="label">Dejaron sus datos en la landing</div>
                <div className="value">{datos.landing.visitantes ? pct(datos.landing.pctDatos) : '—'}</div>
                <div className="sub">
                  {datos.landing.dejaronDatos} de {datos.landing.visitantes} visitantes (mismo visitante);{' '}
                  {datos.landing.personas} personas en {datos.landing.envios} envíos
                </div>
              </div>
              <div className="stat">
                <div className="label">Interesados sobre visitantes</div>
                <div className="value">{datos.landing.visitantes ? pct(datos.landing.pct) : '—'}</div>
                <div className="sub">
                  {datos.landing.interesados} de {datos.landing.visitantes} visitantes dejaron un registro de interés
                </div>
              </div>
              <div className="stat">
                <div className="label">Contacto sobre visitantes</div>
                <div className="value">{datos.landing.visitantes ? pct(datos.landing.pctContacto) : '—'}</div>
                <div className="sub">
                  {datos.contacto.n} de {datos.landing.visitantes} visitantes pidieron que los contacten
                </div>
              </div>
            </div>
          </section>

          <section className="block">
            <div className="block-head">
              <h2>Simulador</h2>
              <span className="count">
                {datos.simulador.desde ? `Simulaciones contadas desde el ${dia(datos.simulador.desde)}` : 'Aún sin simulaciones'}
              </span>
            </div>
            <div className="stats">
              <div className="stat">
                <div className="label">Simularon</div>
                <div className="value">{datos.landing.visitantes ? pct(datos.simulador.pct) : '—'}</div>
                <div className="sub">
                  {datos.simulador.visitantes} de {datos.landing.visitantes} visitantes usaron el simulador
                </div>
              </div>
              <div className="stat">
                <div className="label">Simularon y dejaron sus datos</div>
                <div className="value">{datos.simulador.visitantes ? pct(datos.simulador.pctDatos) : '—'}</div>
                <div className="sub">
                  {datos.simulador.dejaronDatos} de {datos.simulador.visitantes} que simularon enviaron sus datos con la simulación (mismo visitante);{' '}
                  {datos.simulador.contactos} de {datos.landing.envios} envíos traen simulación
                  {datos.experimento.desde && '. Solo cuenta el formulario largo; el corto está en "Experimento"'}
                </div>
              </div>
              <div className="stat">
                <div className="label">Monto y plazo promedio</div>
                <div className="value">
                  {datos.simulador.contactos ? '$' + datos.simulador.montoPromedio.toLocaleString('es-CO') : '—'}
                </div>
                <div className="sub">
                  {datos.simulador.contactos
                    ? `${datos.simulador.cuotasPromedio.toLocaleString('es-CO')} cuotas en promedio, de ${datos.simulador.contactos} solicitudes con simulación`
                    : 'Aún no hay solicitudes con simulación'}
                </div>
              </div>
            </div>
          </section>

          <section className="block">
            <div className="block-head">
              <h2>Experimento: contacto rápido desde el simulador</h2>
              <span className="count">
                {datos.experimento.desde
                  ? `${datos.experimento.encendida ? 'Encendido' : 'Apagado'} · cuenta desde el ${fechaHora(datos.experimento.desde)}` +
                    (datos.experimento.hasta ? ` hasta el ${fechaHora(datos.experimento.hasta)}` : '')
                  : 'El interruptor aún no se ha encendido'}
              </span>
            </div>
            <div className="stats">
              <div className="stat">
                <div className="label">Simularon y dejaron sus datos (señal)</div>
                <div className="value">{datos.experimento.simularon ? pct(datos.experimento.pct) : '—'}</div>
                <div className="sub">
                  {datos.experimento.dejaronDatos} de {datos.experimento.simularon} visitantes que simularon desde que se encendió:{' '}
                  {datos.experimento.corto} con el formulario corto y {datos.experimento.largo} con el largo (alguien puede usar los dos)
                </div>
              </div>
              <div className="stat">
                <div className="label">Línea base (antes de encender)</div>
                <div className="value">{datos.experimento.base.simularon ? pct(datos.experimento.base.pct) : '—'}</div>
                <div className="sub">
                  {datos.experimento.base.dejaronDatos} de {datos.experimento.base.simularon} que simularon dejaron sus datos con el
                  formulario largo
                  {datos.experimento.base.hasta && `, hasta el primer encendido (${fechaHora(datos.experimento.base.hasta)})`}
                </div>
              </div>
              <div className="stat">
                <div className="label">Decisión según la regla</div>
                <div className="value">{DECISION[datos.experimento.decision]}</div>
                <div className="sub">
                  Avanzar: ≥ 25 % y ≥ 1,5 × la línea base. Parar: &lt; 10 % o sin superar la línea base. Si no, iterar. Se decide
                  con al menos {datos.experimento.muestraMinima} visitantes y 2 semanas.
                  {datos.experimento.desde &&
                    ` Van ${datos.experimento.simularon} de ${datos.experimento.muestraMinima} visitantes y ${datos.experimento.diasEncendido} de 14 días.`}
                  {datos.experimento.regla &&
                    !['parar', 'iterar', 'avanzar'].includes(datos.experimento.decision) &&
                    ` Con los datos de hoy, la regla diría: ${REGLA[datos.experimento.regla]}.`}
                </div>
              </div>
            </div>
          </section>

          <section className="block">
            <div className="block-head">
              <h2>Por semana</h2>
              <span className="count">Últimas {datos.semanas.length} semanas (inicia el lunes)</span>
            </div>
            <div className="chart">
              <div className="legend">
                <span>
                  <i style={{ background: 'var(--magenta)' }} />
                  Usuarios nuevos
                </span>
                <span>
                  <i style={{ background: 'var(--blue)' }} />
                  Usuarios que entraron
                </span>
              </div>
              <Grafico semanas={datos.semanas} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
