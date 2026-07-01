// src/components/Header.jsx
// Reemplaza al <header> del index.html original.
// Recibe sesion para mostrar el enlace Admin solo si rol === 'admin'.
// Controla el cambio de subpágina mediante onChangePage y resalta la actual.

export default function Header({ 
  cartCount, 
  onToggleCart, 
  sesion, 
  currentPage, 
  onChangePage,
  favsCount = 0,
  onToggleFavs
}) {
  const isAdmin = sesion?.activo && sesion?.usuario?.rol === 'admin';

  const handleNav = (e, page) => {
    e.preventDefault();
    onChangePage?.(page);
  };

  return (
    <header>
      <a href="#inicio" className="logo" onClick={(e) => handleNav(e, 'inicio')}>
        <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
          <rect width="44" height="44" rx="8" fill="#001f3f" />
          <text x="5" y="32" fontFamily="Arial" fontSize="20" fill="#00cfff" fontWeight="bold">
            V
          </text>
          <text x="23" y="32" fontFamily="Arial" fontSize="20" fill="#ffffff" fontWeight="300">
            L
          </text>
        </svg>
        <span className="logo-text">
          <span>Vice</span>Lete
        </span>
      </a>
      <nav>
        <ul>
          <li>
            <a
              href="#inicio"
              className={currentPage === 'inicio' ? 'active-nav' : ''}
              onClick={(e) => handleNav(e, 'inicio')}
            >
              Inicio
            </a>
          </li>
          <li>
            <a
              href="#catalogo"
              className={currentPage === 'catalogo' ? 'active-nav' : ''}
              onClick={(e) => handleNav(e, 'catalogo')}
            >
              Catálogo
            </a>
          </li>
          <li>
            <a
              href="#perfil"
              className={currentPage === 'perfil' ? 'active-nav' : ''}
              onClick={(e) => handleNav(e, 'perfil')}
            >
              Perfil
            </a>
          </li>
          <li>
            <a
              href="#checkout"
              className={currentPage === 'checkout' ? 'active-nav' : ''}
              onClick={(e) => handleNav(e, 'checkout')}
            >
              Checkout
            </a>
          </li>
          {isAdmin && (
            <li>
              <a
                href="#admin"
                className={`nav-admin-link ${currentPage === 'admin' ? 'active-nav-admin' : ''}`}
                onClick={(e) => handleNav(e, 'admin')}
              >
                ⚙ Admin
              </a>
            </li>
          )}
        </ul>
      </nav>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Botón de favoritos: corazón blanco en círculo cian */}
        <button className="nav-favs" onClick={onToggleFavs} aria-label="Ver favoritos" title="Ver favoritos">
          ♥
          {favsCount > 0 && <span className="favs-count">{favsCount}</span>}
        </button>

        <button className="nav-cart" onClick={onToggleCart}>
          <span>🛒</span>
          <span className="cart-count" id="cartCount">
            {cartCount}
          </span>
        </button>
      </div>
    </header>
  );
}


