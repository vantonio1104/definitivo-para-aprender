// src/components/Header.jsx
// Reemplaza al <header> del index.html original.

export default function Header({ cartCount, onToggleCart }) {
  return (
    <header>
      <a href="#inicio" className="logo">
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
            <a href="#inicio">Inicio</a>
          </li>
          <li>
            <a href="#catalogo">Catálogo</a>
          </li>
          <li>
            <a href="#perfil">Perfil</a>
          </li>
          <li>
            <a href="#checkout">Checkout</a>
          </li>
        </ul>
      </nav>
      <button className="nav-cart" onClick={onToggleCart}>
        <span>🛒</span> Carrito
        <span className="cart-count" id="cartCount">
          {cartCount}
        </span>
      </button>
    </header>
  );
}
