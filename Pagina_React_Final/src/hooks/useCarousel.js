// src/hooks/useCarousel.js
// Reemplaza a la sección 8 de main.js: índice activo, intervalos de
// avance automático y barra de progreso, todo con setInterval sobre el DOM.
// Aquí los timers viven en useEffect y el progreso es estado de React.

import { useCallback, useEffect, useRef, useState } from 'react';

const DURATION = 5000; // ms entre slides, igual que el original (carouselDuration)
const TICK = 40; // ms entre actualizaciones de la barra (carouselTick)

export function useCarousel(count) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const elapsedRef = useRef(0);

  const goTo = useCallback(
    (i) => {
      if (!count) return;
      setIndex(((i % count) + count) % count);
      elapsedRef.current = 0;
      setProgress(0);
    },
    [count]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Avance automático + barra de progreso. Se reinicia cada vez que
  // cambia el índice (equivalente a resetCarouselTimer() del original).
  useEffect(() => {
    if (!count) return;
    elapsedRef.current = 0;

    const tickId = window.setInterval(() => {
      elapsedRef.current += TICK;
      const percent = Math.min(100, (elapsedRef.current / DURATION) * 100);
      setProgress(percent);
    }, TICK);

    const slideId = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
      elapsedRef.current = 0;
      setProgress(0);
    }, DURATION);

    return () => {
      window.clearInterval(tickId);
      window.clearInterval(slideId);
    };
  }, [count, index]);

  return { index, progress, next, prev, goTo };
}
