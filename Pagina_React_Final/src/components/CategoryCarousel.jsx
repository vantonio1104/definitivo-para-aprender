// src/components/CategoryCarousel.jsx
// Reemplaza al bloque #catalogo (cat-grid / cat-card) del index.html
// original y a initCategoryCarousel/prevCategory/nextCategory/
// setCategorySlide de main.js. El avance automático y la barra de
// progreso viven en useCarousel; este componente solo presenta.

import { CATEGORIES } from '../data/categories';
import { useCarousel } from '../hooks/useCarousel';

export default function CategoryCarousel({ onSelectCategory }) {
  const { index, progress, next, prev } = useCarousel(CATEGORIES.length);

  return (
    <section id="catalogo">
      <div className="section-header" style={{ padding: '60px 100px 0', maxWidth: 1300, margin: '0 auto' }}>
        <div className="section-tag">Nuestras Líneas</div>
        <h2 className="section-title">Colecciones</h2>
        <div className="section-line" />
      </div>
      <div className="cat-carousel">
        <div className="cat-carousel-window">
          <button className="btn-outline carousel-nav left" type="button" onClick={prev}>
            ←
          </button>
          <div className="cat-grid" id="catGrid">
            {CATEGORIES.map((cat, i) => (
              <div
                key={cat.name}
                className={`cat-card${i === index ? ' active' : ' hidden'}`}
                onClick={() => onSelectCategory?.(cat.name)}
                data-cat-index={i}
              >
                <img className="cat-img" src={cat.img} alt={cat.name} />
                <div className="cat-overlay">
                  <div className="cat-tag">Línea</div>
                  <div className="cat-name">{cat.name}</div>
                  <div className="cat-desc">{cat.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-outline carousel-nav right" type="button" onClick={next}>
            →
          </button>
        </div>
        <div className="cat-carousel-progress">
          <span className="carousel-progress-fill" id="carouselProgress" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </section>
  );
}
