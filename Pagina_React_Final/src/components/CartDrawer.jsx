// src/components/CartDrawer.jsx
// Reemplaza al panel de carrito que llenaba updateCart() con innerHTML,
// y al bloque <div class="cart-drawer">...</div> del index.html original
// (header con botón cerrar, lista de items, footer con total y link a checkout).

import { formatPrice } from '../data/products';

export default function CartDrawer({ cart, isOpen, total, onClose, onChangeQty, onRemove, onNavigate }) {
  return (
    <>
      <div className={`cart-overlay${isOpen ? ' open' : ''}`} id="cartOverlay" onClick={onClose} />
      <div className={`cart-drawer${isOpen ? ' open' : ''}`} id="cartDrawer">
        <div className="cart-header-d">
          <h3>Tu Carrito</h3>
          <button className="cart-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="cart-items" id="cartItemsEl">
          {!cart.length ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <p>
                Tu carrito está vacío.
                <br />
                Agrega productos para comenzar.
              </p>
            </div>
          ) : (
            cart.map((x) => (
              <div className="cart-item" key={x.id}>
                <img className="cart-item-img" src={x.img} alt={x.name} />
                <div className="cart-item-info">
                  <div className="cart-item-name">{x.name}</div>
                  <div className="cart-item-price">{formatPrice(x.price)}</div>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => onChangeQty(x.id, -1)}>
                      −
                    </button>
                    <span style={{ fontSize: '.85em' }}>{x.qty}</span>
                    <button className="qty-btn" onClick={() => onChangeQty(x.id, 1)}>
                      +
                    </button>
                  </div>
                  <button className="cart-item-remove" onClick={() => onRemove(x.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer-d">
          <div className="cart-total">
            <span>Total</span>
            <span id="cartTotalEl">{formatPrice(total)}</span>
          </div>
          <button className="btn-primary" style={{ width: '100%', border: 'none' }} onClick={() => { onClose(); onNavigate?.('checkout'); }}>
            Ir al Checkout →
          </button>
        </div>
      </div>
    </>
  );
}
