// src/components/ProductDetailMenu.jsx
// Modal de detalle de producto: muestra materiales, marca, stock
// y calcula el costo de envío según la región seleccionada.
//
// Recibe las siguientes props:
//   product    → objeto del producto a mostrar (o null si está cerrado)
//   onClose    → función para cerrar el modal
//   onAddToCart→ función para agregar al carrito desde el modal

import { useState } from 'react';
import { formatPrice } from '../data/products';
import { REGIONES, DIAS_ENTREGA, UMBRAL_ENVIO_GRATIS } from '../data/shipping';

export default function ProductDetailMenu({ product, onClose, onAddToCart }) {
  // Región seleccionada en el selector de envío (vacía por defecto)
  const [regionCodigo, setRegionCodigo] = useState('');

  // Si no hay producto, no renderizamos nada (modal cerrado)
  if (!product) return null;

  // Calculamos si el producto tiene envío gratis según umbral definido
  const envioGratis = product.price >= UMBRAL_ENVIO_GRATIS;

  // Buscamos la tarifa de la región seleccionada
  const regionSeleccionada = REGIONES.find((r) => r.codigo === regionCodigo);
  const tarifaEnvio = regionSeleccionada
    ? envioGratis
      ? 0
      : regionSeleccionada.tarifa
    : null;
  const diasEntrega = regionCodigo ? DIAS_ENTREGA[regionCodigo] : null;

  // El botón de compra se deshabilita si el stock es 0
  const sinStock = product.stock === 0;

  // Cierra el modal al hacer clic en el fondo oscuro
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Cierra el modal con la tecla Escape
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    // overlay: fondo semitransparente que cubre toda la pantalla
    <div
      className="pdm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${product.name}`}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Contenedor principal del modal */}
      <div className="pdm-modal">

        {/* Encabezado: imagen + nombre + botón cerrar */}
        <div className="pdm-header">
          <div className="pdm-img-wrap">
            <img
              src={product.img}
              alt={product.name}
              className="pdm-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          <div className="pdm-header-info">
            {/* Badge de categoría */}
            <span className="pdm-cat">{product.cat}</span>

            {/* Nombre del producto */}
            <h2 className="pdm-name">{product.name}</h2>

            {/* Marca */}
            <p className="pdm-brand">por <strong>{product.marca}</strong></p>

            {/* Precio */}
            <p className="pdm-price">{formatPrice(product.price)}</p>

            {/* Badge de producto nuevo */}
            {product.isNew && <span className="pdm-badge-new">Nuevo ingreso</span>}
            {product.badge && <span className="pdm-badge">{product.badge}</span>}
          </div>

          {/* Botón de cerrar (X) */}
          <button
            className="pdm-close"
            onClick={onClose}
            aria-label="Cerrar detalle del producto"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo del modal: datos de detalle */}
        <div className="pdm-body">

          {/* ── SECCIÓN: MATERIALES ─────────────────── */}
          <div className="pdm-section">
            <h3 className="pdm-section-title">🧵 Materiales y composición</h3>
            <p className="pdm-section-text">{product.materiales}</p>
          </div>

          {/* ── SECCIÓN: STOCK ──────────────────────── */}
          <div className="pdm-section">
            <h3 className="pdm-section-title">📦 Disponibilidad</h3>
            {sinStock ? (
              <span className="pdm-stock pdm-stock--agotado">Sin stock</span>
            ) : product.stock <= 3 ? (
              <span className="pdm-stock pdm-stock--poco">
                ¡Solo {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'}!
              </span>
            ) : (
              <span className="pdm-stock pdm-stock--ok">
                {product.stock} unidades disponibles
              </span>
            )}
          </div>

          {/* ── SECCIÓN: ENVÍO ──────────────────────── */}
          <div className="pdm-section">
            <h3 className="pdm-section-title">🚚 Calcular costo de envío</h3>

            {/* Aviso de envío gratis si aplica */}
            {envioGratis && (
              <p className="pdm-envio-gratis">
                ✅ Este producto tiene <strong>envío gratis</strong> a todo Chile
              </p>
            )}

            {/* Selector de región */}
            <div className="pdm-shipping-row">
              <label htmlFor={`region-${product.id}`} className="pdm-label">
                Selecciona tu región:
              </label>
              <select
                id={`region-${product.id}`}
                className="pdm-select"
                value={regionCodigo}
                onChange={(e) => setRegionCodigo(e.target.value)}
              >
                <option value="">— Elige una región —</option>
                {REGIONES.map((r) => (
                  <option key={r.codigo} value={r.codigo}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Resultado del cálculo de envío */}
            {regionSeleccionada && (
              <div className="pdm-shipping-result">
                <div className="pdm-shipping-line">
                  <span>Envío a {regionSeleccionada.nombre}:</span>
                  <strong className={tarifaEnvio === 0 ? 'pdm-gratis' : 'pdm-tarifa'}>
                    {tarifaEnvio === 0
                      ? 'GRATIS'
                      : formatPrice(tarifaEnvio)}
                  </strong>
                </div>
                {diasEntrega && (
                  <div className="pdm-shipping-line pdm-dias">
                    <span>Entrega estimada:</span>
                    <span>{diasEntrega}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pie del modal: botón de agregar al carrito */}
        <div className="pdm-footer">
          <button className="pdm-btn-close-txt" onClick={onClose}>
            Cerrar
          </button>
          <button
            className={`pdm-btn-add ${sinStock ? 'pdm-btn-add--disabled' : ''}`}
            onClick={() => {
              if (!sinStock) {
                onAddToCart?.(product.id);
                onClose();
              }
            }}
            disabled={sinStock}
            aria-disabled={sinStock}
            title={sinStock ? 'Producto sin stock' : `Agregar ${product.name} al carrito`}
          >
            {sinStock ? '❌ Sin stock' : '🛒 Agregar al carrito'}
          </button>
        </div>

      </div>
    </div>
  );
}
