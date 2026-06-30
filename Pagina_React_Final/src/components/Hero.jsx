// src/components/Hero.jsx
// Reemplaza a la sección #inicio + .stats-bar del index.html original.
// Contenido 100% estático, sin lógica de main.js asociada.

export default function Hero() {
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
            <a href="#catalogo" className="btn-primary">
              Explorar Colección
            </a>
            <a href="#perfil" className="btn-outline">
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
