// src/hooks/useCart.js
// Reemplaza a las variables sueltas `cart` + updateCart/addToCart/changeQty/removeFromCart de main.js.
// Todo vive en estado de React en vez de variables globales.
//
// Modificado para recibir productsList (desde useProducts) y validar stock en tiempo real.

import { useState } from 'react';

export function useCart(productsList = [], onAdd) {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (id) => {
    const producto = productsList.find((x) => x.id === id);
    if (!producto) return;

    // Verificar si el producto tiene stock disponible
    if (producto.stock <= 0) {
      onAdd?.(`No hay stock disponible para ${producto.name}`);
      return;
    }

    setCart((prev) => {
      const existente = prev.find((x) => x.id === id);
      const qtyExistente = existente ? existente.qty : 0;

      // No permitir agregar más unidades que el stock disponible
      if (qtyExistente >= producto.stock) {
        onAdd?.(`Stock máximo alcanzado (${producto.stock} unidades) para ${producto.name}`);
        return prev;
      }

      if (existente) {
        return prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...prev, { ...producto, qty: 1 }];
    });

    onAdd?.(`${producto.name} agregado al carrito`);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((x) => x.id !== id));
  };

  const changeQty = (id, delta) => {
    const producto = productsList.find((x) => x.id === id);
    if (!producto) return;

    setCart((prev) => {
      const existente = prev.find((x) => x.id === id);
      if (!existente) return prev;

      const nuevaQty = existente.qty + delta;

      // No permitir que exceda el stock actual
      if (nuevaQty > producto.stock) {
        onAdd?.(`Solo quedan ${producto.stock} unidades de ${producto.name}`);
        return prev;
      }

      return prev
        .map((x) => (x.id === id ? { ...x, qty: nuevaQty } : x))
        .filter((x) => x.qty > 0);
    });
  };

  const clearCart = () => setCart([]);

  const toggleCart = () => setIsOpen((v) => !v);
  const closeCart = () => setIsOpen(false);

  const count = cart.reduce((s, x) => s + x.qty, 0);
  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);

  return { cart, isOpen, count, total, addToCart, removeFromCart, changeQty, clearCart, toggleCart, closeCart };
}