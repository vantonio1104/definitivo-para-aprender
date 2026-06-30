// src/hooks/useProductFilters.js
// Reemplaza a `let filtered` + filterProducts() + sortProducts() de main.js.
// En el original, sortProducts ordenaba sobre el filtro ya aplicado;
// aquí mantenemos category y sort como dos piezas de estado independientes
// y derivamos la lista final con useMemo (mismo resultado, sin mutación).

import { useMemo, useState } from 'react';
import { products as PRODUCTS } from '../data/products';

export function useProductFilters() {
  const [category, setCategory] = useState('Todos');
  const [sort, setSort] = useState('');

  const filtered = useMemo(() => {
    let list = category === 'Todos' ? [...PRODUCTS] : PRODUCTS.filter((p) => p.cat === category);

    if (sort === 'asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sort === 'desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sort === 'new') {
      list = [...list].sort((a, b) => b.isNew - a.isNew);
    }

    return list;
  }, [category, sort]);

  // Igual que filterProducts(cat, btn): cambia categoría y hace scroll a #productos
  const filterByCategory = (cat) => {
    setCategory(cat);
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return { category, sort, filtered, filterByCategory, setSort };
}
