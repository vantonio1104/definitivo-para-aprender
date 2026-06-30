// src/components/Footer.jsx
// Reemplaza al <footer> del index.html original.

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg viewBox="0 0 44 44" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
              <rect width="44" height="44" rx="8" fill="#001f3f" />
              <text x="5" y="32" fontFamily="Arial" fontSize="20" fill="#00cfff" fontWeight="bold">
                V
              </text>
              <text x="23" y="32" fontFamily="Arial" fontSize="20" fill="#ffffff" fontWeight="300">
                L
              </text>
            </svg>
            <span style={{ fontSize: '1.2em', fontWeight: 200, letterSpacing: 4, textTransform: 'uppercase' }}>
              <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>Vice</span>Lete
            </span>
          </div>
          <p>Moda de lujo para el Chile que exige lo mejor. Diseño, calidad y exclusividad en cada pieza de nuestra colección.</p>
        </div>
        <div className="footer-col">
          <h4>Colecciones</h4>
          <ul>
            <li>
              <a href="#">Casual Premium</a>
            </li>
            <li>
              <a href="#">Formal Elite</a>
            </li>
            <li>
              <a href="#">Sport Lete</a>
            </li>
            <li>
              <a href="#">Alta Costura</a>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Servicio</h4>
          <ul>
            <li>
              <a href="#">Guía de Tallas</a>
            </li>
            <li>
              <a href="#">Devoluciones</a>
            </li>
            <li>
              <a href="#">Envíos</a>
            </li>
            <li>
              <a href="#">Contacto</a>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Empresa</h4>
          <ul>
            <li>
              <a href="#">Nuestra Historia</a>
            </li>
            <li>
              <a href="#">Sustentabilidad</a>
            </li>
            <li>
              <a href="#">Trabaja con Nosotros</a>
            </li>
            <li>
              <a href="#">Prensa</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 ViceLete Chile. Todos los derechos reservados.</span>
        <span>RUT: 76.xxx.xxx-x · Santiago, Chile</span>
      </div>
      <div className="footer-academic" style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '1rem 2rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.5rem 2rem',
        fontSize: '0.82rem',
        color: 'rgba(255,255,255,0.55)',
        textAlign: 'center',
      }}>
        <span><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Alumno:</strong> Vicente Antonio Letelier Orellana</span>
        <span><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Profesor:</strong> Víctor Armando Vásquez Muñoz</span>
        <span><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Asignatura:</strong> Programación Front End</span>
        <span><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Sección:</strong> IEI-N3-P2-C1</span>
      </div>
    </footer>
  );
}
