// src/hooks/useFavorites.js
// Reemplaza a `let favs = new Set()` + toggleFav() de main.js.

import { useCallback, useState } from 'react';

export function useFavorites(onAdd) {
  const [favs, setFavs] = useState(() => new Set());

  const toggleFav = useCallback(
    (id) => {
      setFavs((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
          onAdd?.();
        }
        return next;
      });
    },
    [onAdd]
  );

  return { favs, toggleFav };
}
