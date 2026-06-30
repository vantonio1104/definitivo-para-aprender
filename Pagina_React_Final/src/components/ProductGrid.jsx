// src/components/ProductGrid.jsx
// Reemplaza a la sección #productos completa del index.html original:
// botones .filter-btn, <select> de orden, y el grid #prodGrid.
// La lógica de filtrado/orden vive en useProductFilters (hook),
// este componente solo presenta y dispara callbacks.

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
}) {
  return (
    <section id="productos" className="section">
      <div className="section-header">
        <div className="section-tag">Selección Exclusiva</div>
        <h2 className="section-title">Productos Destacados</h2>
        <div className="section-line" />
      </div>

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
              <div className="prod-img-wrap">
                <img className="prod-img" src={p.img} alt={p.name} loading="lazy" />
                {p.badge && <span className={`prod-badge${p.isNew ? ' new' : ''}`}>{p.badge}</span>}
                {p.isNew && !p.badge && <span className="prod-badge new">Nuevo</span>}
                <button
                  className={`prod-fav${favs.has(p.id) ? ' active' : ''}`}
                  onClick={() => onToggleFav?.(p.id)}
                >
                  ♥
                </button>
              </div>
              <div className="prod-info">
                <div className="prod-cat">{p.cat}</div>
                <div className="prod-name">{p.name}</div>
                <div className="prod-bottom">
                  <span className="prod-price">{formatPrice(p.price)}</span>
                  <button className="btn-add" onClick={() => onAddToCart?.(p.id)}>
                    + Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
