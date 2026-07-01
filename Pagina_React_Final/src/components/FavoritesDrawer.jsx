// src/components/FavoritesDrawer.jsx
// Panel lateral deslizable para favoritos.
// Muestra la lista de productos favoritos y permite:
//   - Quitar de favoritos
//   - Agregar al carrito
//   - Abrir el modal de detalles del producto

import { formatPrice } from '../data/products';

export default function FavoritesDrawer({
  favs = new Set(),
  products = [],
  isOpen,
  onClose,
  onRemove,
  onAddToCart,
  onViewDetails,
}) {
  // Filtramos la lista de productos que están marcados como favoritos
  const favProducts = products.filter((p) => favs.has(p.id));

  return (
    <>
      {/* Fondo oscuro para cerrar al hacer clic */}
      <div 
        className={`cart-overlay${isOpen ? ' open' : ''}`} 
        id="favsOverlay" 
        onClick={onClose} 
      />

      {/* Cajón lateral de favoritos */}
      <div className={`cart-drawer${isOpen ? ' open' : ''}`} id="favsDrawer">
        
        {/* Encabezado */}
        <div className="cart-header-d">
          <h3>Mis Favoritos ♥</h3>
          <button className="cart-close" onClick={onClose} aria-label="Cerrar favoritos">
            ✕
          </button>
        </div>

        {/* Lista de productos favoritos */}
        <div className="cart-items">
          {favProducts.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">♥</div>
              <p>
                No tienes productos favoritos aún.
                <br />
                Haz clic en el corazón de cualquier producto para guardarlo aquí.
              </p>
            </div>
          ) : (
            favProducts.map((p) => (
              <div className="cart-item" key={p.id}>
                {/* Imagen en miniatura */}
                <img 
                  className="cart-item-img" 
                  src={p.img} 
                  alt={p.name} 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                
                {/* Info del producto */}
                <div className="cart-item-info">
                  <div className="cart-item-name" style={{ fontWeight: 'bold' }}>{p.name}</div>
                  <div className="cart-item-price">{formatPrice(p.price)}</div>
                  <small style={{ color: 'var(--gray)', display: 'block', margin: '4px 0' }}>
                    Stock: {p.stock > 0 ? `${p.stock} uds` : 'Agotado'}
                  </small>

                  {/* Acciones de cada favorito */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                    
                    {/* Botón Ver detalles */}
                    <button 
                      className="btn-ver-detalle" 
                      style={{ margin: 0, padding: '4px 8px', fontSize: '0.65em', flex: '1 1 auto' }}
                      onClick={() => {
                        onViewDetails?.(p);
                        onClose(); // Cierra el cajón al abrir detalles
                      }}
                    >
                      Detalles ↗
                    </button>

                    {/* Botón Agregar al carrito */}
                    <button 
                      className="btn-add" 
                      style={{ padding: '4px 8px', fontSize: '0.65em', flex: '1 1 auto' }}
                      onClick={() => onAddToCart?.(p.id)}
                      disabled={p.stock === 0}
                      title={p.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                    >
                      🛒 {p.stock === 0 ? 'Agotado' : 'Añadir'}
                    </button>
                    
                  </div>

                  {/* Botón Eliminar de favoritos */}
                  <button 
                    className="cart-item-remove" 
                    style={{ marginTop: '8px', fontSize: '0.7em' }}
                    onClick={() => onRemove?.(p.id)}
                  >
                    Quitar de favoritos
                  </button>

                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="cart-footer-d" style={{ textAlign: 'center', padding: '20px' }}>
          <button 
            className="btn-outline" 
            style={{ width: '100%' }} 
            onClick={onClose}
          >
            Continuar Comprando
          </button>
        </div>

      </div>
    </>
  );
}
