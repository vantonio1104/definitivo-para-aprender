// src/data/products.js
// Mismos datos que tenías en main.js, solo que ahora viven solos.
// Rutas de imagen asumen que las pusiste en public/imagenes/...

export const products = [
  { id: 1, name: 'Chaqueta Cuero Biker', cat: 'Casual', price: 250000, img: '/imagenes/chaquetas/chaqueta1.png', badge: 'Bestseller', isNew: false },
  { id: 2, name: 'Chaqueta Bomber Neon', cat: 'Casual', price: 200000, img: '/imagenes/chaquetas/chaqueta2.png', badge: '', isNew: true },
  { id: 3, name: 'Chaqueta Tron Edition', cat: 'Deportiva', price: 225000, img: '/imagenes/chaquetas/chaqueta3.jpg', badge: 'Exclusivo', isNew: true },
  { id: 4, name: 'Traje Doble Botonadura', cat: 'Formal', price: 5000000, img: '/imagenes/trajes/traje1.jpg', badge: 'Premium', isNew: false },
  { id: 5, name: 'Zapatillas Classic Sport', cat: 'Casual', price: 200000, img: '/imagenes/zapatillas/zapa1.jpg', badge: '', isNew: false },
  { id: 6, name: 'Zapatillas NZXT Gaming', cat: 'Deportiva', price: 500000, img: '/imagenes/zapatillas/zapa2.jpg', badge: 'Exclusivo', isNew: true },
  { id: 7, name: 'Zapatillas White Runner', cat: 'Deportiva', price: 225000, img: '/imagenes/zapatillas/zapa3.jpg', badge: '', isNew: false },
  { id: 8, name: 'Zapatillas Neon Sport', cat: 'Deportiva', price: 250000, img: '/imagenes/zapatillas/zapa4.jpg', badge: '', isNew: true },
  { id: 9, name: 'Nike Mag Future Lete', cat: 'Lujo', price: 2000000, img: '/imagenes/zapatillas/zapa5.jpg', badge: 'Exclusivo', isNew: false },
];

export const formatPrice = (n) => '$' + n.toLocaleString('es-CL') + ' CLP';