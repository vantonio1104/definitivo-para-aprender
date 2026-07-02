import { formatPrice } from '../data/products';
import { useExternalProducts } from '../hooks/useExternalProducts';

/**
 * Formatea precio en USD (los productos de FakeStoreAPI vienen en dólares).
 */
const formatUSD = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;

/**
 * Skeleton de carga — muestra 4 tarjetas placeholder con animación pulse.
 */
function SkeletonGrid() {
  return (
    <div className="prod-grid" id="external-trends-skeleton">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="prod-card" key={i} style={{ opacity: 0.5 }}>
          <div
            className="prod-img-wrap"
            style={{
              background: 'linear-gradient(135deg, #001830 0%, #002244 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="external-skeleton-pulse" />
          </div>
          <div className="prod-info">
            <div
              className="external-skeleton-line"
              style={{ width: '40%', height: 10, marginBottom: 8 }}
            />
            <div
              className="external-skeleton-line"
              style={{ width: '80%', height: 14, marginBottom: 12 }}
            />
            <div
              className="external-skeleton-line"
              style={{ width: '50%', height: 18 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ExternalTrends({
  onAddToCart,
  onViewDetails,
  favs = new Set(),
  onToggleFav,
  externalProductsData, // Permite inyectar los datos ya cargados si vienen de App.jsx
}) {
  const hookData = useExternalProducts();
  
  // Si se pasan por props (para la carga global sincronizada del carrito), los usamos; si no, del hook local
  const { loading, error, data } = externalProductsData || hookData;

  return (
    <section id="tendencias-externas" className="section">
      <div className="section-header">
        <div className="section-tag">Inspiración Global</div>
        <h2 className="section-title">Tendencias Internacionales</h2>
        <div className="section-line" />
      </div>

      {/* Estado: cargando */}
      {loading && <SkeletonGrid />}

      {/* Estado: error */}
      {!loading && error && (
        <div className="external-error-wrap">
          <div className="external-error-icon">⚠️</div>
          <p className="external-error-msg">{error}</p>
        </div>
      )}

      {/* Estado: sin datos */}
      {!loading && !error && data.length === 0 && (
        <div className="prod-grid">
          <p style={{ color: 'var(--gray)', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>
            No hay tendencias disponibles en este momento.
          </p>
        </div>
      )}

      {/* Estado: datos cargados */}
      {!loading && !error && data.length > 0 && (
        <div className="prod-grid" id="external-trends-grid">
          {data.map((p) => (
            <div className="prod-card" key={p.id}>
              {/* Imagen y badges */}
              <div className="prod-img-wrap" style={{ background: '#fff' }}>
                <img
                  className="prod-img"
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  style={{ objectFit: 'contain', padding: 16 }}
                />
                
                {/* Badge de categoría */}
                {p.badge && <span className="prod-badge">{p.badge}</span>}

                {/* Indicador sin stock si aplicara */}
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
                <div className="prod-cat">
                  {p.cat}
                </div>
                <div className="prod-name" title={p.name}>
                  {p.name}
                </div>

                <div className="prod-bottom" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="prod-price" style={{ fontSize: '1.1em' }}>{formatPrice(p.price)}</span>
                    <span style={{ color: 'var(--gray)', fontSize: '0.75em' }}>
                      Aprox. {formatUSD(p.originalPriceUSD)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginTop: 4 }}>
                    {/* Rating si viene de la API */}
                    {p.rating ? (
                      <span className="external-rating" title={`${p.rating.count} reseñas`}>
                        ⭐ {p.rating.rate}
                      </span>
                    ) : <span></span>}

                    <button
                      className="btn-add"
                      onClick={() => onAddToCart?.(p.id)}
                      disabled={p.stock === 0}
                      aria-disabled={p.stock === 0}
                      title={p.stock === 0 ? 'Sin stock' : `Agregar ${p.name} al carrito`}
                    >
                      {p.stock === 0 ? 'Agotado' : '+ Agregar'}
                    </button>
                  </div>
                </div>

                {/* Botón "Ver detalles" → abre el modal */}
                <button
                  className="btn-ver-detalle"
                  onClick={() => onViewDetails?.(p)}
                  aria-label={`Ver detalles de ${p.name}`}
                  style={{ marginTop: 12 }}
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
