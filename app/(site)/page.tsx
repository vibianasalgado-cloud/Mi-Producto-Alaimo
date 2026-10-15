/* eslint-disable @next/next/no-img-element */
import ThemeToggle from '@/components/ThemeToggle';
import FormFeedback from '@/components/FormFeedback';
import FormInteres from '@/components/FormInteres';

export default function Home() {
  return (
    <>
    <header className="site">
      <div className="nav">
        <div className="nav-left">
          <label htmlFor="nav-toggle" className="nav-toggle-btn" aria-label="Abrir menú">
            <span></span><span></span><span></span>
          </label>
          <div className="wordmark"><span className="dot"></span>Nequi</div>
        </div>
        <input type="checkbox" id="nav-toggle" className="nav-toggle-input" />
        <nav className="nav-links">
          <a href="#donde-usar">Dónde usarlo</a>
          <a href="#tu-dinero">Tu dinero</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#forma-de-pago">Forma de pago</a>
          <a href="#comercios">Comercios aliados</a>
          <a href="#preguntas">Preguntas</a>
          <a href="#comentarios">Comentarios</a>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <a className="btn btn-primary btn-nav" href="#activar">Actívalo</a>
        </div>
      </div>
    </header>

    <main className="wrap">

      <section className="hero" id="activar" style={{ marginTop: "20px" }}>
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="hero-inner">
          <div>
            <span className="eyebrow">Crédito en comercios</span>
            <h1>Compra en tus tiendas favoritas y paga <em>a tu ritmo</em></h1>
            <p className="lead">
              Úsalo en cualquier comercio con datáfono Redeban o en las tiendas online
              donde veas el botón de Nequi al momento de pagar. Eliges cuántas cuotas
              pagar y listo, sin vueltas.
            </p>
            <div className="hero-ctas">
              <a className="btn btn-primary" href="#">Actívalo en la app Nequi</a>
              <a className="btn btn-ghost-dark" href="#comercios">Ver comercios aliados</a>
            </div>
            <div className="hero-facts">
              <div className="hero-fact"><b>$50.000</b><span>compra mínima</span></div>
              <div className="hero-fact"><b>Tú eliges</b><span>número de cuotas</span></div>
              <div className="hero-fact"><b>Al instante</b><span>fácil y rápido</span></div>
            </div>
          </div>

          <div className="phone">
            <span className="phone-tag">Botón Nequi</span>
            <div className="phone-notch"></div>
            <div className="phone-card">
              <span className="label">Total a pagar</span>
              <div className="amount">$128.000</div>
              <div className="phone-row">
                <span>Pagar con</span>
                <strong>Crédito en comercios</strong>
              </div>
              <span className="label" style={{ display: "block", marginTop: "14px" }}>Elige tus cuotas</span>
              <div className="quota-pills">
                <div className="quota-pill">3</div>
                <div className="quota-pill active">6</div>
                <div className="quota-pill">12</div>
              </div>
              <div className="phone-cta">Confirmar compra</div>
            </div>
          </div>
        </div>
      </section>

      <section id="donde-usar">
        <div className="section-head">
          <span className="kicker">Dónde usarlo</span>
          <h2>Un solo crédito, dos formas de pagar</h2>
          <p>Tu Crédito en comercios funciona igual de fácil en el mundo físico y en el digital.</p>
        </div>
        <div className="where-grid">
          <div className="where-card">
            <div className="where-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="1.8"/><rect x="7" y="6" width="10" height="6" rx="1" stroke="currentColor" strokeWidth="1.6"/><circle cx="9" cy="17" r="1.2" fill="currentColor"/><circle cx="13" cy="17" r="1.2" fill="currentColor"/></svg>
            </div>
            <span className="chip">Comercios físicos</span>
            <h3>Con datáfono Redeban</h3>
            <p>
              Acércate a pagar en cualquier comercio que tenga datáfono Redeban, pide pagar
              con Nequi y selecciona tu Crédito en comercios. Aplica desde compras de $50.000.
            </p>
          </div>
          <div className="where-card">
            <div className="where-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8"/><path d="M3 9h18" stroke="currentColor" strokeWidth="1.8"/><circle cx="7.5" cy="14.5" r="1.3" fill="currentColor"/></svg>
            </div>
            <span className="chip">Comercios online</span>
            <h3>Con el botón Nequi</h3>
            <p>
              Al pagar en tiendas online, busca el botón de Nequi en la pasarela de pago.
              Elige tu Crédito en comercios y define en cuántas cuotas quieres pagar.
            </p>
          </div>
        </div>
      </section>

      <section id="tu-dinero">
        <div className="section-head">
          <span className="kicker">¿A dónde va tu dinero?</span>
          <h2>Nequi le paga al comercio. A ti no te llega ese dinero</h2>
          <p>Es la duda más común sobre este crédito, así que vamos directo al punto: tu cupo nunca pasa por tu cuenta ni por tu Disponible.</p>
        </div>
        <div className="payment-grid">
          <div className="payment-card">
            <div className="payment-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12h13M11 6l5 6-5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><rect x="17" y="4" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="1.6"/></svg>
            </div>
            <h3>El pago va directo al comercio</h3>
            <p>
              Apenas confirmas tu compra, Nequi le transfiere al comercio el 100% del valor,
              de una sola vez. Para el comercio es un pago normal, como cualquier venta.
            </p>
          </div>
          <div className="payment-card">
            <div className="payment-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8"/><path d="M8 15.5l2.2-2.6L12.5 15l3.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 9h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
            </div>
            <h3>Tú no recibes el dinero</h3>
            <p>
              El cupo aprobado no entra a tu Disponible ni a ninguna otra cuenta tuya:
              se usa únicamente para pagarle al comercio en el momento exacto de la compra.
            </p>
          </div>
          <div className="payment-card">
            <div className="payment-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.8"/><path d="M3 9h18M8 2.5v3M16 2.5v3M7.5 14h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <h3>Tu deuda queda con Nequi</h3>
            <p>
              Lo que debes por esa compra es con Nequi, no con el comercio. Por eso pagas tus
              cuotas dentro de la app y el comercio no vuelve a intervenir en tu pago.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="stats">
          <div className="stat-tile accent">
            <b>$50.000 COP</b>
            <span>Compra mínima para pagar con tu Crédito en comercios.</span>
          </div>
          <div className="stat-tile">
            <b>Cuotas a tu medida</b>
            <span>Elige el número de cuotas que mejor se ajuste a tu bolsillo.</span>
          </div>
          <div className="stat-tile">
            <b>Fácil y rápido</b>
            <span>Actívalo y úsalo desde la app, sin filas ni papeleo.</span>
          </div>
        </div>
      </section>

      <section id="como-funciona">
        <div className="section-head">
          <span className="kicker">Cómo funciona</span>
          <h2>Así compras con tu Crédito en comercios en el datáfono Redeban</h2>
          <p>Sin claves que memorizar ni tarjetas adicionales: todo pasa dentro de tu Nequi, en segundos.</p>
        </div>
        <div className="steps steps-datafono">
          <div className="step">
            <span className="num">01</span>
            <h3>Pagas en el datáfono</h3>
            <p>El comercio pasa tu compra por el datáfono Redeban, como cualquier pago con tarjeta.</p>
          </div>
          <div className="step">
            <span className="num">02</span>
            <h3>Te llega la notificación</h3>
            <p>En segundos, te llega una notificación a tu Nequi para confirmar la compra.</p>
          </div>
          <div className="step">
            <span className="num">03</span>
            <h3>Aceptas la notificación</h3>
            <p>Abres la notificación y aceptas para seguir con tu pago.</p>
          </div>
          <div className="step">
            <span className="num">04</span>
            <h3>Eliges cómo pagar</h3>
            <p>Seleccionas si pagas con tu Crédito en comercios o con tu Disponible.</p>
          </div>
          <div className="step">
            <span className="num">05</span>
            <h3>Eliges tus cuotas</h3>
            <p>Si pagas con crédito, escoges en cuántas cuotas quieres pagar tu compra.</p>
          </div>
          <div className="step">
            <span className="num">06</span>
            <h3>Confirmas con tu rostro</h3>
            <p>Te pedimos una validación de biometría facial para confirmar que eres tú.</p>
          </div>
        </div>

        <div className="security-banner">
          <div className="security-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <h3>¡Listo, así de fácil! Cuidamos tu seguridad</h3>
            <p>Antes de confirmar cualquier compra con tu Crédito en comercios, siempre verificamos que eres tú con biometría facial. Así protegemos tu cupo, aunque alguien más tenga tu celular o esté frente al datáfono.</p>
          </div>
        </div>

        <div className="section-head" style={{ marginTop: "56px" }}>
          <span className="kicker">Y si compras en línea</span>
          <h2>Así compras con tu Crédito en comercios en tiendas online</h2>
          <p>El mismo crédito, en cuatro pasos, sin pasar por ningún datáfono.</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="num">01</span>
            <h3>Llegas a pagar</h3>
            <p>En el checkout de la tienda online, busca el botón de Nequi entre los medios de pago.</p>
          </div>
          <div className="step">
            <span className="num">02</span>
            <h3>Eliges cómo pagar</h3>
            <p>Selecciona pagar con tu Crédito en comercios entre las opciones de pago de Nequi.</p>
          </div>
          <div className="step">
            <span className="num">03</span>
            <h3>Eliges tus cuotas</h3>
            <p>Escoges en cuántas cuotas quieres pagar esa compra, igual que en el datáfono.</p>
          </div>
          <div className="step">
            <span className="num">04</span>
            <h3>Confirmas con tu rostro</h3>
            <p>Validamos con biometría facial y la tienda recibe la confirmación de tu pago al instante.</p>
          </div>
        </div>
      </section>

      <section id="forma-de-pago">
        <div className="section-head">
          <span className="kicker">Forma de pago</span>
          <h2>Tu crédito, pagado a tu manera</h2>
          <p>Así se descuentan tus cuotas cada mes, sin que tengas que hacer nada extra.</p>
        </div>
        <div className="payment-grid">
          <div className="payment-card">
            <div className="payment-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.8"/><path d="M3 9h18M8 2.5v3M16 2.5v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <h3>Cuotas mensuales</h3>
            <p>
              Apenas tu compra queda confirmada con éxito, tu Crédito en comercios se activa
              y tu fecha de pago se fija en ese momento: el mismo día de tu compra, 30 días después.
              Por ejemplo, si compras el 8, tu primera cuota vence el 8 del mes siguiente, y así cada mes.
            </p>
          </div>
          <div className="payment-card">
            <div className="payment-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3v18M7 8l5-5 5 5M7 16l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3>Puedes abonar a capital</h3>
            <p>
              Si quieres pagar más rápido, puedes hacer abonos extra a capital cuando quieras
              desde la app y así reducir tus cuotas pendientes o el plazo de tu crédito.
              <span className="revisar">REVISAR: dónde se hace el abono en la app</span>
            </p>
          </div>
          <div className="payment-card">
            <div className="payment-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3>Débito automático</h3>
            <p>
              El día de tu fecha de pago, la cuota se descuenta automáticamente de tu disponible
              en Nequi. Solo asegúrate de tener el saldo listo ese día.
              <span className="revisar">REVISAR: qué pasa si no hay saldo suficiente</span>
            </p>
          </div>
        </div>
      </section>

      <section id="comercios">
        <div className="section-head">
          <span className="kicker">Comercios aliados</span>
          <h2>Ya lo puedes usar en marcas que sigues todos los días</h2>
          <p className="merchants-note">
            Logos de marca de cada comercio aliado.
          </p>
        </div>
        <div className="logo-grid">
          <div className="logo-badge">
            <img src="/logos/americanino.svg" alt="Americanino" />
          </div>
          <div className="logo-badge">
            <img src="/logos/shein.svg" alt="Shein" />
          </div>
          <div className="logo-badge">
            <img src="/logos/temu.svg" alt="Temu" />
          </div>
          <div className="logo-badge">
            <img src="/logos/chevignon.png" alt="Chevignon" />
          </div>
          <div className="logo-badge">
            <img src="/logos/cruzverde.svg" alt="Cruz Verde" />
          </div>
          <div className="logo-badge">
            <img src="/logos/farmatodo.svg" alt="Farmatodo" />
          </div>
        </div>
      </section>

      <section id="preguntas">
        <div className="section-head">
          <span className="kicker">Preguntas frecuentes</span>
          <h2>Todo lo que debes saber antes de usarlo</h2>
        </div>
        <div className="faq">
          <details open>
            <summary>¿Dónde puedo usar mi Crédito en comercios?</summary>
            <p>En cualquier comercio físico con datáfono Redeban y en comercios digitales que muestren el botón de Nequi en su pasarela de pago.</p>
          </details>
          <details>
            <summary>¿El dinero me llega a mí o se lo pagan directo al comercio?</summary>
            <p>No pasa por tu cuenta ni tienes que darle nada al comercio por fuera: en el momento de la compra, Nequi le paga directamente al comercio el valor total. A ti solo te queda esa compra reflejada en cuotas dentro de tu Crédito en comercios.</p>
          </details>
          <details>
            <summary>¿Cuándo queda activo mi crédito y cuál es mi fecha de pago?</summary>
            <p>Tu Crédito en comercios queda activo en el momento en que tu compra se confirma con éxito. Ahí mismo se fija tu fecha de pago: el mismo día de tu compra, 30 días después. Puedes verla junto con el valor de tu cuota dentro de la app.</p>
          </details>
          <details>
            <summary>¿Cuál es la compra mínima para usarlo?</summary>
            <p>Puedes pagar con tu Crédito en comercios desde compras de $50.000 COP en adelante.</p>
          </details>
          <details>
            <summary>¿Puedo elegir el número de cuotas?</summary>
            <p>Sí, tú decides en cuántas cuotas prefieres pagar tu compra antes de confirmarla. <span className="revisar">REVISAR: opciones exactas de cuotas</span></p>
          </details>
          <details>
            <summary>¿Cómo protegen mi compra en el datáfono?</summary>
            <p>Cuando pagas en un datáfono Redeban, te llega una notificación a tu Nequi y, antes de confirmar, te pedimos una validación de biometría facial para asegurarnos de que eres tú. Así cuidamos tu cupo aunque alguien más tenga acceso a tu celular.</p>
          </details>
          <details>
            <summary>¿Cómo se paga cada cuota?</summary>
            <p>Tus cuotas son mensuales y se descuentan automáticamente de tu disponible en Nequi el día de tu fecha de pago, sin que tengas que hacer nada.</p>
          </details>
          <details>
            <summary>¿Puedo abonar a capital para pagar más rápido?</summary>
            <p>Sí, puedes hacer abonos extra a capital cuando quieras desde la app para reducir tus cuotas pendientes o el plazo de tu crédito. <span className="revisar">REVISAR: dónde se hace el abono en la app</span></p>
          </details>
          <details>
            <summary>¿Cómo sé cuánto cupo tengo disponible?</summary>
            <p>Puedes consultar tu cupo disponible directamente en la sección de Crédito en comercios dentro de la app. <span className="revisar">REVISAR</span></p>
          </details>
          <details>
            <summary>¿Tiene algún costo activarlo?</summary>
            <p>La activación y las condiciones del crédito se muestran dentro de la app antes de confirmar. <span className="revisar">REVISAR: tasas y costos</span></p>
          </details>
        </div>
      </section>

      <section id="comentarios">
        <div className="section-head">
          <span className="kicker">Tus comentarios</span>
          <h2>Cuéntanos qué piensas de esta página</h2>
        </div>
        <FormFeedback />
      </section>

      <section>
        <div className="cta-band">
          <div className="blob blob1" style={{ top: "-100px", right: "-60px" }}></div>
          <span className="eyebrow" style={{ color: "#FBBEDE" }}>Listo para usarlo</span>
          <h2>Tu próxima compra puede quedar en cuotas hoy mismo</h2>
          <p>Actívalo desde la app Nequi y empieza a usarlo en comercios con datáfono Redeban o donde veas el botón Nequi.</p>
          <a className="btn btn-primary" href="#">Actívalo en la app Nequi</a>
          <FormInteres />
        </div>
      </section>

    </main>

    <footer className="wrap">
      <div className="foot-top">
        <div className="wordmark" style={{ fontSize: "1.05rem" }}><span className="dot"></span>Nequi</div>
        <span>Nequi S.A. Compañía de Financiamiento</span>
      </div>
      <p>
        Este contenido es una pieza educativa sobre el Crédito en comercios para clientes Nequi.
        Cupo, tasas, plazos y condiciones específicas se muestran dentro de la app antes de activar
        el producto y están sujetos a aprobación. <span className="revisar">REVISAR con Legal/Producto</span>
      </p>
    </footer>
    </>
  );
}
