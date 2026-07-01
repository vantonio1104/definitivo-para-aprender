// src/hooks/useProductFilters.js
// Reemplaza a `let filtered` + filterProducts() + sortProducts() de main.js.
// Recibe el array de productos como argumento (en lugar de importarlo
// directamente) para que useProducts sea la única fuente de verdad y
// los cambios del CRUD se reflejen en tiempo real en el grid.

import { useMemo, useState } from 'react';

export function useProductFilters(products = []) {
  const [category, setCategory] = useState('Todos');
  const [sort, setSort] = useState('');

  const filtered = useMemo(() => {
    let list =
      category === 'Todos' ? [...products] : products.filter((p) => p.cat === category);

    if (sort === 'asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sort === 'desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sort === 'new') {
      list = [...list].sort((a, b) => b.isNew - a.isNew);
    }

    return list;
  }, [products, category, sort]);

  // Igual que filterProducts(cat, btn): cambia categoría y hace scroll a #productos
  const filterByCategory = (cat) => {
    setCategory(cat);
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return { category, sort, filtered, filterByCategory, setSort };
}
