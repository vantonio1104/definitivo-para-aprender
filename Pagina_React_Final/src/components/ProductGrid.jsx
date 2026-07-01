// src/components/ProductGrid.jsx
// Reemplaza a la sección #productos completa del index.html original:
// botones .filter-btn, <select> de orden, y el grid #prodGrid.
// La lógica de filtrado/orden vive en useProductFilters (hook),
// este componente solo presenta y dispara callbacks.
//
// Cambio agregado: cada tarjeta tiene un botón "Ver detalles" que abre
// ProductDetailMenu (modal) con información completa del producto.

import { formatPrice } from '../data/products';

const FILTER_OPTIONS = ['Todos', 'Casual', 'Formal', 'Deportiva', 'Lujo'];

export default function ProductGrid({
  products,
  favs = new Set(),
  category,
  sort,
  onFilterChange,
  onSortChange,
  onToggleFav,
  onAddToCart,
  onViewDetails,
}) {
  return (
    <section id="productos" className="section">
      <div className="section-header">
        <div className="section-tag">Selección Exclusiva</div>
        <h2 className="section-title">Productos Destacados</h2>
        <div className="section-line" />
      </div>

      {/* Filtros de categoría y selector de orden */}
      <div className="prod-filters">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt}
            className={`filter-btn${category === opt ? ' active' : ''}`}
            onClick={() => onFilterChange?.(opt)}
          >
            {opt}
          </button>
        ))}
        <select className="filter-select" value={sort} onChange={(e) => onSortChange?.(e.target.value)}>
          <option value="">Ordenar por</option>
          <option value="asc">Menor precio</option>
          <option value="desc">Mayor precio</option>
          <option value="new">Nuevo ingreso</option>
        </select>
      </div>

      {/* Grid de productos */}
      {!products.length ? (
        <div className="prod-grid" id="prodGrid">
          <p style={{ color: 'var(--gray)', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>
            No hay productos en esta categoría.
          </p>
        </div>
      ) : (
        <div className="prod-grid" id="prodGrid">
          {products.map((p) => (
            <div className="prod-card" key={p.id}>

              {/* Imagen y badges superpuestos */}
              <div className="prod-img-wrap">
                <img className="prod-img" src={p.img} alt={p.name} loading="lazy" />

                {/* Badge de producto */}
                {p.badge && <span className={`prod-badge${p.isNew ? ' new' : ''}`}>{p.badge}</span>}
                {p.isNew && !p.badge && <span className="prod-badge new">Nuevo</span>}

                {/* Indicador de sin stock sobre la imagen */}
                {p.stock === 0 && (
                  <span className="prod-sin-stock">Sin stock</span>
                )}

                {/* Botón favorito */}
                <button
                  className={`prod-fav${favs.has(p.id) ? ' active' : ''}`}
                  onClick={() => onToggleFav?.(p.id)}
                  aria-label={`${favs.has(p.id) ? 'Quitar de' : 'Agregar a'} favoritos: ${p.name}`}
                >
                  ♥
                </button>
              </div>

              {/* Info del producto */}
              <div className="prod-info">
                <div className="prod-cat">{p.cat}</div>
                <div className="prod-name">{p.name}</div>

                <div className="prod-bottom">
                  <span className="prod-price">{formatPrice(p.price)}</span>
                  <button
                    className="btn-add"
                    onClick={() => onAddToCart?.(p.id)}
                    disabled={p.stock === 0}
                    aria-disabled={p.stock === 0}
                    title={p.stock === 0 ? 'Sin stock' : `Agregar ${p.name} al carrito`}
                  >
                    {p.stock === 0 ? 'Sin stock' : '+ Agregar'}
                  </button>
                </div>

                {/* Botón "Ver detalles" → abre el modal */}
                <button
                  className="btn-ver-detalle"
                  onClick={() => onViewDetails?.(p)}
                  aria-label={`Ver detalles de ${p.name}`}
                >
                  Ver detalles ↗
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </section>
  );
}

