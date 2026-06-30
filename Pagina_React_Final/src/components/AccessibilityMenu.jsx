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

import { useState, useEffect } from 'react';
import '../styles/accessibility.css';

const AccessibilityMenu = () => {
  // Estado para controlar la apertura/cierre del menú
  const [isOpen, setIsOpen] = useState(false);

  // Estados de configuración de accesibilidad
  const [fontSize, setFontSize] = useState(100); // Porcentaje de tamaño base
  const [contrast, setContrast] = useState('normal'); // normal, high, inverted, grayscale
  const [letterSpacing, setLetterSpacing] = useState(0); // en px
  const [lineHeight, setLineHeight] = useState(1.5); // múltiplo
  const [dyslexiaFont, setDyslexiaFont] = useState(false); // boolean
  const [highlightLinks, setHighlightLinks] = useState(false); // boolean
  const [highlightHeadings, setHighlightHeadings] = useState(false); // boolean
  const [largeCursor, setLargeCursor] = useState(false); // boolean
  const [stopAnimations, setStopAnimations] = useState(false); // boolean

  // Cargar configuraciones guardadas en localStorage al montar el componente
  useEffect(() => {
    loadAccessibilitySettings();
  }, []);

  // Aplicar cambios de accesibilidad cuando cambian los estados
  useEffect(() => {
    applyAccessibilitySettings();
  }, [fontSize, contrast, letterSpacing, lineHeight, dyslexiaFont, highlightLinks, highlightHeadings, largeCursor, stopAnimations]);

  /**
   * Carga las configuraciones guardadas en localStorage
   */
  const loadAccessibilitySettings = () => {
    try {
      const settings = JSON.parse(localStorage.getItem('accessibilitySettings'));
      if (settings) {
        setFontSize(settings.fontSize || 100);
        setContrast(settings.contrast || 'normal');
        setLetterSpacing(settings.letterSpacing || 0);
        setLineHeight(settings.lineHeight || 1.5);
        setDyslexiaFont(settings.dyslexiaFont || false);
        setHighlightLinks(settings.highlightLinks || false);
        setHighlightHeadings(settings.highlightHeadings || false);
        setLargeCursor(settings.largeCursor || false);
        setStopAnimations(settings.stopAnimations || false);
      }
    } catch (error) {
      console.warn('Error al cargar configuración de accesibilidad:', error);
    }
  };

  /**
   * Guarda las configuraciones en localStorage
   */
  const saveAccessibilitySettings = () => {
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
  };

  /**
   * Aplica los estilos de accesibilidad al documento raíz
   */
  const applyAccessibilitySettings = () => {
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

    // Aplicar espaciado de letras
    root.style.letterSpacing = letterSpacing > 0 ? `${letterSpacing}px` : 'normal';

    // Aplicar altura de línea
    root.style.lineHeight = lineHeight;

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

    // Guardar configuración
    saveAccessibilitySettings();
  };

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
  };

  /**
   * Alterna el menú de accesibilidad
   */
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

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
          // Ícono ISA universal de accesibilidad: figura humana con brazos y piernas abiertos
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Cabeza */}
            <circle cx="50" cy="17" r="10" fill="#0066cc" />
            {/* Cuerpo */}
            <rect x="45" y="29" width="10" height="22" rx="5" fill="#0066cc" />
            {/* Brazo izquierdo */}
            <rect x="19" y="31" width="27" height="8" rx="4" fill="#0066cc" />
            {/* Brazo derecho */}
            <rect x="54" y="31" width="27" height="8" rx="4" fill="#0066cc" />
            {/* Pierna izquierda */}
            <rect x="34" y="50" width="9" height="29" rx="4.5" fill="#0066cc" transform="rotate(-10 38 50)" />
            {/* Pierna derecha */}
            <rect x="57" y="50" width="9" height="29" rx="4.5" fill="#0066cc" transform="rotate(10 62 50)" />
          </svg>
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
