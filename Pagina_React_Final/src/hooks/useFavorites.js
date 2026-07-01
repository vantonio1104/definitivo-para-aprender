import { useCallback, useState } from 'react';

export function useFavorites(onAdd) {
  const [favs, setFavs] = useState(() => new Set());

  const toggleFav = useCallback(
    (id) => {
      // Determinamos si ya era favorito usando el estado actual de la renderización
      const wasFav = favs.has(id);

      setFavs((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });

      // Si no era favorito, disparamos la notificación afuera de setFavs
      if (!wasFav) {
        onAdd?.();
      }
    },
    [favs, onAdd]
  );

  return { favs, toggleFav };
}

