/**
 * AccessibilityMenu.jsx
 * Componente de menú flotante de accesibilidad
 * 
 * Características:
 * - Botón flotante en esquina inferior derecha
 * - Panel deslizante de configuración de accesibilidad
 * - Gestiona: tamaño de texto, contraste, legibilidad, navegación visual
 * - Persiste todas las configuraciones en localStorage
 * - Aplica estilos dinámicos al documento raíz
 */

import { useState, useEffect, useCallback } from 'react';
import '../styles/accessibility.css';

// Función auxiliar para cargar la configuración inicial de localStorage de forma segura
const getSavedSettings = () => {
  try {
    const settings = localStorage.getItem('accessibilitySettings');
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.warn('Error al cargar configuración de accesibilidad:', error);
    return null;
  }
};

const AccessibilityMenu = () => {
  // Estado para controlar la apertura/cierre del menú
  const [isOpen, setIsOpen] = useState(false);

  // Estados de configuración de accesibilidad (inicializados de forma diferida desde localStorage)
  const [fontSize, setFontSize] = useState(() => getSavedSettings()?.fontSize || 100);
  const [contrast, setContrast] = useState(() => getSavedSettings()?.contrast || 'normal');
  const [letterSpacing, setLetterSpacing] = useState(() => getSavedSettings()?.letterSpacing || 0);
  const [lineHeight, setLineHeight] = useState(() => getSavedSettings()?.lineHeight || 1.5);
  const [dyslexiaFont, setDyslexiaFont] = useState(() => getSavedSettings()?.dyslexiaFont || false);
  const [highlightLinks, setHighlightLinks] = useState(() => getSavedSettings()?.highlightLinks || false);
  const [highlightHeadings, setHighlightHeadings] = useState(() => getSavedSettings()?.highlightHeadings || false);
  const [largeCursor, setLargeCursor] = useState(() => getSavedSettings()?.largeCursor || false);
  const [stopAnimations, setStopAnimations] = useState(() => getSavedSettings()?.stopAnimations || false);

  /**
   * Aplica los estilos de accesibilidad al documento raíz y guarda en localStorage
   */
  const applyAccessibilitySettings = useCallback(() => {
    const root = document.documentElement;
    
    // Aplicar tamaño de fuente
    root.style.fontSize = `${fontSize}%`;

    // Aplicar contraste
    switch (contrast) {
      case 'high':
        root.style.filter = 'contrast(1.2)';
        root.classList.add('accessibility-high-contrast');
        root.classList.remove('accessibility-inverted', 'accessibility-grayscale');
        break;
      case 'inverted':
        root.style.filter = 'invert(1)';
        root.classList.add('accessibility-inverted');
        root.classList.remove('accessibility-high-contrast', 'accessibility-grayscale');
        break;
      case 'grayscale':
        root.style.filter = 'grayscale(1)';
        root.classList.add('accessibility-grayscale');
        root.classList.remove('accessibility-high-contrast', 'accessibility-inverted');
        break;
      default:
        root.style.filter = 'none';
        root.classList.remove('accessibility-high-contrast', 'accessibility-inverted', 'accessibility-grayscale');
    }

    // Aplicar espaciado de letras mediante variable CSS + clase
    root.style.setProperty('--a11y-letter-spacing', `${letterSpacing}px`);
    if (letterSpacing > 0) {
      root.classList.add('accessibility-custom-letter-spacing');
    } else {
      root.classList.remove('accessibility-custom-letter-spacing');
    }

    // Aplicar altura de línea mediante variable CSS + clase
    root.style.setProperty('--a11y-line-height', String(lineHeight));
    if (lineHeight !== 1.5) {
      root.classList.add('accessibility-custom-line-height');
    } else {
      root.classList.remove('accessibility-custom-line-height');
    }

    // Aplicar fuente amigable para dislexia
    if (dyslexiaFont) {
      root.classList.add('accessibility-dyslexia-font');
    } else {
      root.classList.remove('accessibility-dyslexia-font');
    }

    // Aplicar resaltado de enlaces
    if (highlightLinks) {
      root.classList.add('accessibility-highlight-links');
    } else {
      root.classList.remove('accessibility-highlight-links');
    }

    // Aplicar resaltado de encabezados
    if (highlightHeadings) {
      root.classList.add('accessibility-highlight-headings');
    } else {
      root.classList.remove('accessibility-highlight-headings');
    }

    // Aplicar cursor grande
    if (largeCursor) {
      root.classList.add('accessibility-large-cursor');
    } else {
      root.classList.remove('accessibility-large-cursor');
    }

    // Detener animaciones
    if (stopAnimations) {
      root.classList.add('accessibility-no-animations');
    } else {
      root.classList.remove('accessibility-no-animations');
    }

    // Guardar configuración en localStorage
    try {
      const settings = {
        fontSize,
        contrast,
        letterSpacing,
        lineHeight,
        dyslexiaFont,
        highlightLinks,
        highlightHeadings,
        largeCursor,
        stopAnimations,
      };
      localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Error al guardar configuración de accesibilidad:', error);
    }
  }, [fontSize, contrast, letterSpacing, lineHeight, dyslexiaFont, highlightLinks, highlightHeadings, largeCursor, stopAnimations]);

  /**
   * Aumenta el tamaño de fuente en 10%
   */
  const increaseFontSize = () => {
    if (fontSize < 200) {
      setFontSize(fontSize + 10);
    }
  };

  /**
   * Disminuye el tamaño de fuente en 10%
   */
  const decreaseFontSize = () => {
    if (fontSize > 80) {
      setFontSize(fontSize - 10);
    }
  };

  /**
   * Restablece el tamaño de fuente a 100%
   */
  const resetFontSize = () => {
    setFontSize(100);
  };

  /**
   * Restablece contraste a normal
   */
  const resetContrast = () => {
    setContrast('normal');
  };

  /**
   * Restablece configuración de legibilidad
   */
  const resetReadability = () => {
    setLetterSpacing(0);
    setLineHeight(1.5);
    setDyslexiaFont(false);
    // Limpiar clases y propiedades CSS de accesibilidad
    const root = document.documentElement;
    root.classList.remove('accessibility-custom-letter-spacing', 'accessibility-custom-line-height');
    root.style.removeProperty('--a11y-letter-spacing');
    root.style.removeProperty('--a11y-line-height');
  };

  /**
   * Restablece todas las configuraciones a los valores por defecto
   */
  const resetAllSettings = () => {
    setFontSize(100);
    setContrast('normal');
    setLetterSpacing(0);
    setLineHeight(1.5);
    setDyslexiaFont(false);
    setHighlightLinks(false);
    setHighlightHeadings(false);
    setLargeCursor(false);
    setStopAnimations(false);
    localStorage.removeItem('accessibilitySettings');
    // Limpiar clases y propiedades CSS de accesibilidad
    const root = document.documentElement;
    root.classList.remove('accessibility-custom-letter-spacing', 'accessibility-custom-line-height');
    root.style.removeProperty('--a11y-letter-spacing');
    root.style.removeProperty('--a11y-line-height');
  };

  /**
   * Alterna el menú de accesibilidad
   */
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Aplicar cambios de accesibilidad cuando cambian los estados
  useEffect(() => {
    applyAccessibilitySettings();
  }, [applyAccessibilitySettings]);

  return (
    <>
      {/* Botón flotante de accesibilidad */}
      <button
        className="accessibility-button"
        onClick={toggleMenu}
        aria-label={isOpen ? 'Cerrar menú de accesibilidad' : 'Abrir menú de accesibilidad'}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
      >
        {isOpen ? (
          // Ícono "X" cuando el menú está abierto
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0066cc" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          // Nueva imagen generada con forma de figura humana para accesibilidad
          <img
            src="/imagenes/logo/accessibility_human.png"
            alt="Accesibilidad"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%'
            }}
          />
        )}
      </button>


      {/* Panel de accesibilidad */}
      <div
        id="accessibility-panel"
        className={`accessibility-panel ${isOpen ? 'open' : ''}`}
        role="region"
        aria-label="Panel de configuración de accesibilidad"
      >
        {/* Contenido scrollable - todas las secciones */}
        <div className="accessibility-panel-content">
          {/* Sección: Tamaño de texto */}
          <section className="accessibility-section">
            <h3>Tamaño de Texto</h3>
            <div className="accessibility-controls">
              <button 
                onClick={decreaseFontSize}
                className="accessibility-btn"
                aria-label="Disminuir tamaño de fuente"
              >
                A−
              </button>
              <span className="accessibility-value">{fontSize}%</span>
              <button 
                onClick={increaseFontSize}
                className="accessibility-btn"
                aria-label="Aumentar tamaño de fuente"
              >
                A+
              </button>
              <button 
                onClick={resetFontSize}
                className="accessibility-reset-btn"
                aria-label="Restablecer tamaño de fuente"
              >
                Restablecer
              </button>
            </div>
          </section>

          {/* Sección: Contraste y visualización */}
          <section className="accessibility-section">
            <h3>Contraste y Visualización</h3>
            <div className="accessibility-controls">
              <button 
                onClick={() => setContrast('normal')}
                className={`accessibility-btn ${contrast === 'normal' ? 'active' : ''}`}
                aria-label="Contraste normal"
                aria-pressed={contrast === 'normal'}
              >
                Normal
              </button>
              <button 
                onClick={() => setContrast('high')}
                className={`accessibility-btn ${contrast === 'high' ? 'active' : ''}`}
                aria-label="Alto contraste"
                aria-pressed={contrast === 'high'}
              >
                Alto
              </button>
              <button 
                onClick={() => setContrast('inverted')}
                className={`accessibility-btn ${contrast === 'inverted' ? 'active' : ''}`}
                aria-label="Contraste invertido"
                aria-pressed={contrast === 'inverted'}
              >
                Invertido
              </button>
              <button 
                onClick={() => setContrast('grayscale')}
                className={`accessibility-btn ${contrast === 'grayscale' ? 'active' : ''}`}
                aria-label="Escala de grises"
                aria-pressed={contrast === 'grayscale'}
              >
                Grises
              </button>
              <button 
                onClick={resetContrast}
                className="accessibility-reset-btn"
                aria-label="Restablecer contraste"
              >
                Restablecer
              </button>
            </div>
          </section>

          {/* Sección: Legibilidad */}
          <section className="accessibility-section">
            <h3>Legibilidad</h3>
            
            {/* Espaciado de letras */}
            <div className="accessibility-subsection">
              <label>Espaciado de Letras: {letterSpacing}px</label>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={letterSpacing}
                onChange={(e) => setLetterSpacing(Number(e.target.value))}
                className="accessibility-slider"
                aria-label="Ajustar espaciado de letras"
              />
            </div>

            {/* Altura de línea */}
            <div className="accessibility-subsection">
              <label>Altura de Línea: {lineHeight.toFixed(1)}</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="accessibility-slider"
                aria-label="Ajustar altura de línea"
              />
            </div>

            {/* Fuente para dislexia */}
            <div className="accessibility-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={dyslexiaFont}
                  onChange={(e) => setDyslexiaFont(e.target.checked)}
                  aria-label="Habilitar fuente amigable para dislexia"
                />
                Fuente Dislexia
              </label>
            </div>

            <button 
              onClick={resetReadability}
              className="accessibility-reset-btn full-width"
              aria-label="Restablecer configuración de legibilidad"
            >
              Restablecer Legibilidad
            </button>
          </section>

          {/* Sección: Navegación y Comodidad Visual */}
          <section className="accessibility-section">
            <h3>Navegación y Comodidad</h3>

            <div className="accessibility-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={highlightLinks}
                  onChange={(e) => setHighlightLinks(e.target.checked)}
                  aria-label="Resaltar enlaces"
                />
                Resaltar Enlaces
              </label>
            </div>

            <div className="accessibility-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={highlightHeadings}
                  onChange={(e) => setHighlightHeadings(e.target.checked)}
                  aria-label="Resaltar encabezados"
                />
                Resaltar Encabezados
              </label>
            </div>

            <div className="accessibility-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={largeCursor}
                  onChange={(e) => setLargeCursor(e.target.checked)}
                  aria-label="Mostrar cursor grande"
                />
                Cursor Grande
              </label>
            </div>

            <div className="accessibility-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={stopAnimations}
                  onChange={(e) => setStopAnimations(e.target.checked)}
                  aria-label="Detener animaciones"
                />
                Detener Animaciones
              </label>
            </div>
          </section>
        </div>

        {/* Botón restablecer todo - Fuera del scroll, al final del panel */}
        <button 
          onClick={resetAllSettings}
          className="accessibility-reset-all-btn"
          aria-label="Restablecer todas las configuraciones de accesibilidad"
        >
          Restablecer Todas las Configuraciones
        </button>
      </div>
    </>
  );
};

export default AccessibilityMenu;
