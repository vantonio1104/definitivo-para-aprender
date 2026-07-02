import { useState, useEffect } from 'react';

const API_URL = 'https://fakestoreapi.com/products?limit=8';

const MOCK_FALLBACK = [
  {
    id: 991,
    title: 'Fjallraven - Foldsack No. 1 Backpack (Local Fallback)',
    price: 109.95,
    description: 'Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve.',
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
    rating: { rate: 3.9, count: 120 }
  },
  {
    id: 992,
    title: 'Mens Casual Premium Slim Fit T-Shirts (Local Fallback)',
    price: 22.30,
    description: 'Slim-fit raglan 3/4 sleeve t-shirt, light & soft cotton material for a comfortable fit.',
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
    rating: { rate: 4.1, count: 259 }
  },
  {
    id: 993,
    title: 'John Hardy Women Legends Naga Bracelet (Local Fallback)',
    price: 695.00,
    description: 'From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean\'s pearl.',
    category: 'jewelery',
    image: 'https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_.jpg',
    rating: { rate: 4.6, count: 400 }
  },
  {
    id: 994,
    title: 'WD 2TB Elements Portable External Hard Drive (Local Fallback)',
    price: 64.00,
    description: 'USB 3.0 and USB 2.0 Compatibility Fast data transfers Improve PC Performance High Capacity.',
    category: 'electronics',
    image: 'https://fakestoreapi.com/img/61IBJVJIGmL._AC_SL1000_.jpg',
    rating: { rate: 3.3, count: 203 }
  }
];

/**
 * Maps FakeStoreAPI product format to the local application product schema.
 */
const mapExternalProduct = (p) => {
  // Determine materials based on category and description
  let materiales = 'Fibras mixtas importadas de alta durabilidad.';
  const catLower = (p.category || '').toLowerCase();
  const descLower = (p.description || '').toLowerCase();

  if (catLower.includes('jewelery')) {
    materiales = 'Plata esterlina 925, baño de oro de 18k y gemas sintéticas.';
  } else if (catLower.includes('clothing')) {
    if (descLower.includes('cotton')) {
      materiales = '100% Algodón orgánico de alta densidad.';
    } else if (descLower.includes('polyester')) {
      materiales = '60% Poliéster reciclado, 40% Algodón de fibra larga.';
    } else {
      materiales = '80% Algodón peinado, 20% Fibras elásticas sintéticas.';
    }
  } else if (catLower.includes('electronics')) {
    materiales = 'Chasis de aluminio aeroespacial, componentes semiconductores de silicio de alta eficiencia.';
  }

  // Determine a brand name
  let brand = 'Global Import';
  if (catLower.includes('clothing')) {
    brand = 'ViceLete World';
  } else if (catLower.includes('jewelery')) {
    brand = 'Lete Bijoux';
  } else if (catLower.includes('electronics')) {
    brand = 'Lete Tech';
  }

  return {
    id: 9000 + p.id, // Avoid ID collision with local products (1-15)
    name: p.title,
    cat: p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'Importado',
    price: Math.round(p.price * 950), // Convert USD to CLP
    originalPriceUSD: p.price,
    img: p.image,
    badge: p.rating && p.rating.rate >= 4.5 ? 'Bestseller' : 'Tendencia',
    isNew: false,
    marca: brand,
    materiales,
    stock: p.rating ? Math.max(2, Math.round(p.rating.count / 10)) : 10,
    rating: p.rating,
    isExternal: true,
  };
};

/**
 * Fetches external trending products from FakeStoreAPI.
 * @returns {{ loading: boolean, error: string|null, data: Array }}
 */
export function useExternalProducts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const json = await response.json();

        if (!cancelled) {
          const formatted = Array.isArray(json) ? json.map(mapExternalProduct) : [];
          setData(formatted);
        }
      } catch (err) {
        if (!cancelled) {
          // Si el fetch falla (offline / sandbox), usamos datos de fallback locales
          console.warn('Error al cargar productos externos (cargando fallback):', err);
          const formattedFallback = MOCK_FALLBACK.map(mapExternalProduct);
          setData(formattedFallback);
          setError(null); // Limpiamos el error ya que cargamos el fallback exitosamente
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    // Cleanup: evita actualizar estado si el componente se desmontó
    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, error, data };
}

