// src/hooks/useProducts.js
// Gestiona el estado global de productos con persistencia en localStorage.
// Reemplaza el import estático de products.js en toda la app.
// Los productos iniciales se cargan desde products.js solo cuando el
// localStorage aún no tiene datos (primera visita o storage limpio).

import { useCallback, useState } from 'react';
import { products as INITIAL_PRODUCTS } from '../data/products';

const STORAGE_KEY = 'Lete_productos_v1';

function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    // Auto-migración: si hay menos productos guardados que el catálogo inicial (15),
    // cargamos el nuevo catálogo para que el usuario disfrute de la variedad completa.
    if (Array.isArray(parsed) && parsed.length >= INITIAL_PRODUCTS.length) return parsed;
  } catch (e) {
    console.warn('No se pudo cargar productos:', e);
  }
  // Fallback: datos iniciales hardcodeados
  return INITIAL_PRODUCTS;
}

function saveProducts(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('No se pudo guardar productos:', e);
  }
}

export function useProducts() {
  const [products, setProducts] = useState(loadProducts);

  // Actualiza estado y persiste en localStorage
  const persist = useCallback((updater) => {
    setProducts((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveProducts(next);
      return next;
    });
  }, []);

  /** Agrega un nuevo producto */
  const addProduct = useCallback(
    (data) => {
      const newProduct = {
        id: Date.now(),
        name: String(data.name || '').trim(),
        cat: String(data.cat || 'Casual'),
        price: Number(data.price) || 0,
        img: String(data.img || '').trim(),
        badge: String(data.badge || '').trim(),
        isNew: Boolean(data.isNew),
        marca: String(data.marca || 'Generico').trim(),
        materiales: String(data.materiales || '100% Algodón').trim(),
        stock: Number(data.stock) || 10,
      };
      persist((prev) => [...prev, newProduct]);
      return newProduct;
    },
    [persist]
  );

  /** Actualiza un producto existente por id */
  const updateProduct = useCallback(
    (id, data) => {
      persist((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                name: String(data.name ?? p.name).trim(),
                cat: String(data.cat ?? p.cat),
                price: Number(data.price ?? p.price) || 0,
                img: String(data.img ?? p.img).trim(),
                badge: String(data.badge ?? p.badge).trim(),
                isNew: Boolean(data.isNew ?? p.isNew),
                marca: String(data.marca ?? p.marca).trim(),
                materiales: String(data.materiales ?? p.materiales).trim(),
                stock: Number(data.stock ?? p.stock) || 0,
              }
            : p
        )
      );
    },
    [persist]
  );

  /** Elimina un producto por id */
  const deleteProduct = useCallback(
    (id) => {
      persist((prev) => prev.filter((p) => p.id !== id));
    },
    [persist]
  );

  /** Descuenta del stock de productos según la cantidad comprada en el carrito */
  const discountStock = useCallback(
    (cartItems) => {
      persist((prev) =>
        prev.map((p) => {
          const itemInCart = cartItems.find((x) => x.id === p.id);
          if (itemInCart) {
            // No permitimos que el stock sea menor que 0
            const nextStock = Math.max(0, p.stock - itemInCart.qty);
            return { ...p, stock: nextStock };
          }
          return p;
        })
      );
    },
    [persist]
  );

  return { products, addProduct, updateProduct, deleteProduct, discountStock };
}

