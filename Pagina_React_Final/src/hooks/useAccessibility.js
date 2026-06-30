/**
 * useAccessibility.js
 * Hook personalizado para manejar la lógica de accesibilidad
 * 
 * Permite reutilizar la lógica en múltiples componentes si es necesario
 * Centraliza el manejo del estado y la persistencia en localStorage
 */

import { useState, useCallback } from 'react';

/**
 * Hook para gestionar configuraciones de accesibilidad
 * @returns {Object} Objeto con configuraciones y funciones para manejarlas
 */
export const useAccessibility = () => {
  // Estados de configuración
  const [fontSize, setFontSize] = useState(100);
  const [contrast, setContrast] = useState('normal');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [highlightHeadings, setHighlightHeadings] = useState(false);
  const [largeCursor, setLargeCursor] = useState(false);
  const [stopAnimations, setStopAnimations] = useState(false);

  /**
   * Guarda la configuración en localStorage
   */
  const saveSettings = useCallback(() => {
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
  }, [fontSize, contrast, letterSpacing, lineHeight, dyslexiaFont, highlightLinks, highlightHeadings, largeCursor, stopAnimations]);

  /**
   * Carga la configuración desde localStorage
   */
  const loadSettings = useCallback(() => {
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
  }, []);

  /**
   * Restablece todas las configuraciones
   */
  const resetAllSettings = useCallback(() => {
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
  }, []);

  return {
    // Estados
    fontSize,
    contrast,
    letterSpacing,
    lineHeight,
    dyslexiaFont,
    highlightLinks,
    highlightHeadings,
    largeCursor,
    stopAnimations,
    
    // Setters
    setFontSize,
    setContrast,
    setLetterSpacing,
    setLineHeight,
    setDyslexiaFont,
    setHighlightLinks,
    setHighlightHeadings,
    setLargeCursor,
    setStopAnimations,
    
    // Funciones
    saveSettings,
    loadSettings,
    resetAllSettings,
  };
};
