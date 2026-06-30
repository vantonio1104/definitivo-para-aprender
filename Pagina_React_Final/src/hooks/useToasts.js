// src/hooks/useToasts.js
// Reemplaza a toast() de main.js (createElement + appendChild + setTimeout).
// En React el toast es un item de estado; el componente Toasts.jsx
// se encarga de renderizarlo y desmontarlo solo.

import { useCallback, useRef, useState } from 'react';

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const toast = useCallback((msg) => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, msg, leaving: false }]);

    // A los 3s arranca la animación de salida (igual que el original)
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    }, 3000);

    // A los 3.3s se desmonta del todo
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3300);
  }, []);

  return { toasts, toast };
}
