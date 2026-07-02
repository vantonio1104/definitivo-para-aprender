// src/components/AdminPanel.jsx
// Panel de administración: tabla de productos con CRUD completo.
// Solo se renderiza cuando sesion.usuario.rol === 'admin' (control en App.jsx).

import { useState } from 'react';
import { formatPrice } from '../data/products';
import { sanitizeInput } from '../utils/validation';

const CATEGORIES = ['Casual', 'Formal', 'Deportiva', 'Lujo'];
const BADGES = ['', 'Bestseller', 'Exclusivo', 'Premium'];

const EMPTY_FORM = {
  name: '',
  cat: 'Casual',
  price: '',
  img: '',
  badge: '',
  isNew: false,
  marca: '',
  materiales: '',
  stock: '10',
};

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'El nombre es requerido.';
  if (!form.price || Number(form.price) <= 0) errors.price = 'Ingresa un precio válido.';
  if (!form.marca.trim()) errors.marca = 'La marca es requerida.';
  if (!form.materiales.trim()) errors.materiales = 'Los materiales son requeridos.';
  if (form.stock === '' || Number(form.stock) < 0) errors.stock = 'Ingresa un stock válido.';
  return errors;
}

export default function AdminPanel({ products = [], onAdd, onUpdate, onDelete, toast }) {
  const [editing, setEditing] = useState(null); // id del producto en edición, o null
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null); // id a confirmar
  const [searchTerm, setSearchTerm] = useState('');

  const isFormOpen = creating || editing !== null;

  /* ---- helpers ---- */
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name,
      cat: product.cat,
      price: String(product.price),
      img: product.img,
      badge: product.badge,
      isNew: product.isNew,
      marca: product.marca || '',
      materiales: product.materiales || '',
      stock: String(product.stock ?? 10),
    });
    setErrors({});
    setCreating(false);
    setEditing(product.id);
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    // Sanitizar campos de texto contra inyección de código (mismo patrón que AuthSection/ContactForm)
    const data = { 
      ...form, 
      name: sanitizeInput(form.name),
      img: sanitizeInput(form.img),
      badge: sanitizeInput(form.badge),
      marca: sanitizeInput(form.marca),
      materiales: sanitizeInput(form.materiales),
      price: Number(form.price),
      stock: Number(form.stock) || 0
    };
    if (creating) {
      onAdd(data);
      toast?.('Producto creado ✓');
    } else {
      onUpdate(editing, data);
      toast?.('Producto actualizado ✓');
    }
    closeForm();
  };

  const handleDelete = (id) => setConfirmDelete(id);
  const confirmDeleteAction = () => {
    onDelete(confirmDelete);
    toast?.('Producto eliminado');
    setConfirmDelete(null);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ---- render ---- */
  return (
    <section id="admin" className="admin-section">
      <div className="admin-inner">
        {/* Header del panel */}
        <div className="admin-header">
          <div>
            <div className="section-tag">Panel de Control</div>
            <h2 className="admin-title">Gestión de Productos</h2>
          </div>
          <button className="admin-btn-create" onClick={openCreate}>
            + Nuevo Producto
          </button>
        </div>

        {/* Buscador rápido */}
        <div className="admin-search-wrap">
          <input
            id="admin-search"
            className="admin-search"
            type="text"
            placeholder="Buscar producto por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="admin-count">{filteredProducts.length} productos</span>
        </div>

        {/* Tabla de productos */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre / Marca</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Badge</th>
                <th>Nuevo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    No hay productos que coincidan.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className={editing === p.id ? 'admin-row-editing' : ''}>
                    <td>
                      <div className="admin-thumb-wrap">
                        {p.img ? (
                          <img
                            src={p.img}
                            alt={p.name}
                            className="admin-thumb"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="admin-no-img">Sin img</span>
                        )}
                      </div>
                    </td>
                    <td className="admin-td-name">
                      <div>{p.name}</div>
                      <small style={{ color: 'var(--gray)', fontSize: '0.8em' }}>{p.marca}</small>
                    </td>
                    <td>
                      <span className="admin-cat-pill">{p.cat}</span>
                    </td>
                    <td className="admin-td-price">{formatPrice(p.price)}</td>
                    <td>
                      <span style={{ 
                        fontWeight: 'bold', 
                        color: p.stock === 0 ? '#ff6b6b' : p.stock <= 5 ? '#ffd43b' : '#5ecf7e'
                      }}>
                        {p.stock} ud
                      </span>
                    </td>
                    <td>{p.badge || <span className="admin-none">—</span>}</td>
                    <td>
                      <span className={`admin-badge-bool ${p.isNew ? 'yes' : 'no'}`}>
                        {p.isNew ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn-edit"
                          onClick={() => openEdit(p)}
                          title="Editar"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="admin-btn-delete"
                          onClick={() => handleDelete(p.id)}
                          title="Eliminar"
                        >
                          🗑 Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Formulario crear/editar */}
        {isFormOpen && (
          <div className="admin-form-overlay" onClick={(e) => e.target === e.currentTarget && closeForm()}>
            <div className="admin-form-modal">
              <div className="admin-form-header">
                <h3 className="admin-form-title">
                  {creating ? 'Nuevo Producto' : 'Editar Producto'}
                </h3>
                <button className="admin-form-close" onClick={closeForm}>✕</button>
              </div>

              <form className="admin-form" onSubmit={handleSubmit} noValidate>
                {/* Nombre */}
                <div className="admin-fg">
                  <label htmlFor="af-name">Nombre del Producto</label>
                  <input
                    id="af-name"
                    name="name"
                    type="text"
                    placeholder="Ej: Zapatillas Runner Pro"
                    value={form.name}
                    onChange={handleChange}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="admin-field-error">{errors.name}</span>}
                </div>

                {/* Marca */}
                <div className="admin-fg">
                  <label htmlFor="af-marca">Marca</label>
                  <input
                    id="af-marca"
                    name="marca"
                    type="text"
                    placeholder="Ej: ViceLete Sport"
                    value={form.marca}
                    onChange={handleChange}
                    className={errors.marca ? 'error' : ''}
                  />
                  {errors.marca && <span className="admin-field-error">{errors.marca}</span>}
                </div>

                {/* Materiales */}
                <div className="admin-fg">
                  <label htmlFor="af-materiales">Materiales y Composición</label>
                  <input
                    id="af-materiales"
                    name="materiales"
                    type="text"
                    placeholder="Ej: 95% algodón, 5% elastano"
                    value={form.materiales}
                    onChange={handleChange}
                    className={errors.materiales ? 'error' : ''}
                  />
                  {errors.materiales && <span className="admin-field-error">{errors.materiales}</span>}
                </div>

                {/* Categoría + Badge en fila */}
                <div className="admin-form-row">
                  <div className="admin-fg">
                    <label htmlFor="af-cat">Categoría</label>
                    <select id="af-cat" name="cat" value={form.cat} onChange={handleChange}>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-fg">
                    <label htmlFor="af-badge">Badge</label>
                    <select id="af-badge" name="badge" value={form.badge} onChange={handleChange}>
                      {BADGES.map((b) => (
                        <option key={b} value={b}>{b || '(Sin badge)'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Precio + Stock en fila */}
                <div className="admin-form-row">
                  <div className="admin-fg">
                    <label htmlFor="af-price">Precio (CLP)</label>
                    <input
                      id="af-price"
                      name="price"
                      type="number"
                      min="0"
                      placeholder="Ej: 250000"
                      value={form.price}
                      onChange={handleChange}
                      className={errors.price ? 'error' : ''}
                    />
                    {errors.price && <span className="admin-field-error">{errors.price}</span>}
                  </div>
                  <div className="admin-fg">
                    <label htmlFor="af-stock">Stock disponible</label>
                    <input
                      id="af-stock"
                      name="stock"
                      type="number"
                      min="0"
                      placeholder="Ej: 15"
                      value={form.stock}
                      onChange={handleChange}
                      className={errors.stock ? 'error' : ''}
                    />
                    {errors.stock && <span className="admin-field-error">{errors.stock}</span>}
                  </div>
                </div>

                {/* URL imagen */}
                <div className="admin-fg">
                  <label htmlFor="af-img">URL de Imagen</label>
                  <input
                    id="af-img"
                    name="img"
                    type="text"
                    placeholder="/imagenes/zapatillas/zapa1.jpg"
                    value={form.img}
                    onChange={handleChange}
                  />
                  {form.img && (
                    <div className="admin-img-preview-wrap">
                      <img
                        src={form.img}
                        alt="preview"
                        className="admin-img-preview"
                        onError={(e) => { e.target.style.opacity = 0; }}
                        onLoad={(e) => { e.target.style.opacity = 1; }}
                      />
                    </div>
                  )}
                </div>

                {/* isNew checkbox */}
                <div className="admin-fg admin-fg-check">
                  <label className="admin-check-label" htmlFor="af-isNew">
                    <input
                      id="af-isNew"
                      name="isNew"
                      type="checkbox"
                      checked={form.isNew}
                      onChange={handleChange}
                    />
                    <span>Marcar como <strong>Nuevo ingreso</strong></span>
                  </label>
                </div>

                {/* Botones */}
                <div className="admin-form-footer">
                  <button type="button" className="admin-btn-cancel" onClick={closeForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="admin-btn-save">
                    {creating ? '+ Crear Producto' : '✓ Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Diálogo de confirmación eliminación */}
        {confirmDelete !== null && (
          <div className="admin-confirm-overlay">
            <div className="admin-confirm-box">
              <div className="admin-confirm-icon">⚠️</div>
              <h4>¿Eliminar producto?</h4>
              <p>Esta acción no se puede deshacer.</p>
              <div className="admin-confirm-btns">
                <button className="admin-btn-cancel" onClick={() => setConfirmDelete(null)}>
                  Cancelar
                </button>
                <button className="admin-btn-delete-confirm" onClick={confirmDeleteAction}>
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

