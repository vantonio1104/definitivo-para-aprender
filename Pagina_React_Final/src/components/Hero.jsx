// src/components/Hero.jsx
// Reemplaza a la sección #inicio + .stats-bar del index.html original.
// Se modificó para aceptar onNavigate y controlar el ruteo interno por estados.

export default function Hero({ onNavigate }) {
  const handleNav = (e, page) => {
    e.preventDefault();
    onNavigate?.(page);
  };

  return (
    <>
      <section id="inicio">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-tag">Colección 2026 · Chile</div>
          <h1 className="hero-title">
            Estilo sin
            <br />
            <strong>Compromiso</strong>
          </h1>
          <p className="hero-sub">
            Prendas de lujo para quienes exigen lo mejor. Diseño, exclusividad y sofisticación en cada detalle.
          </p>
          <div className="hero-btns">
            <a
              href="#catalogo"
              className="btn-primary"
              onClick={(e) => handleNav(e, 'catalogo')}
            >
              Explorar Colección
            </a>
            <a
              href="#perfil"
              className="btn-outline"
              onClick={(e) => handleNav(e, 'perfil')}
            >
              Acceso Exclusivo
            </a>
          </div>
        </div>
        <div className="hero-scroll">
          Descubrir
          <div className="scroll-line" />
        </div>
      </section>

      <div className="stats-bar">
        <div className="stat">
          <div className="stat-num">+2.400</div>
          <div className="stat-label">Clientes Premium</div>
        </div>
        <div className="stat">
          <div className="stat-num">180+</div>
          <div className="stat-label">Productos Exclusivos</div>
        </div>
        <div className="stat">
          <div className="stat-num">12</div>
          <div className="stat-label">Años en el Mercado</div>
        </div>
        <div className="stat">
          <div className="stat-num">98%</div>
          <div className="stat-label">Satisfacción</div>
        </div>
      </div>
    </>
  );
}

