// ============================================
// SCRIPT DE TESTING - Panel de Accesibilidad
// ============================================
// Pega esto en la consola del navegador (F12)
// Ejecuta cada función para probar

/**
 * FUNCIÓN 1: Cambiar tamaño de fuente y registrar
 */
function testFontSize(size) {
  document.documentElement.style.fontSize = size;
  console.log(`%c✓ Tamaño de fuente cambiado a: ${size}`, 'color: green; font-size: 14px; font-weight: bold;');
  
  // Datos de diagnóstico
  setTimeout(() => {
    const panel = document.getElementById('accessibility-panel');
    const panelHeight = panel?.offsetHeight || 'No found';
    const panelWidth = panel?.offsetWidth || 'Not found';
    const content = document.querySelector('.accessibility-panel-content');
    const contentHeight = content?.offsetHeight || 'Not found';
    
    console.log(`%cPanel Height: ${panelHeight}px`, 'color: blue;');
    console.log(`%cPanel Width: ${panelWidth}px`, 'color: blue;');
    console.log(`%cContent Height: ${contentHeight}px`, 'color: blue;');
  }, 100);
}

/**
 * FUNCIÓN 2: Verificar scroll
 */
function checkScroll() {
  const content = document.querySelector('.accessibility-panel-content');
  if (!content) {
    console.error('❌ Panel content no encontrado');
    return;
  }
  
  const hasVerticalScroll = content.scrollHeight > content.clientHeight;
  const hasHorizontalScroll = content.scrollWidth > content.clientWidth;
  
  console.log(`%cScroll vertical disponible: ${hasVerticalScroll ? '✅ SÍ' : '❌ NO'}`, 
    hasVerticalScroll ? 'color: green;' : 'color: red;');
  console.log(`%cScroll horizontal: ${hasHorizontalScroll ? '❌ SÍ (PROBLEMA!)' : '✅ NO'}`, 
    hasHorizontalScroll ? 'color: red; font-weight: bold;' : 'color: green;');
  
  console.table({
    'Scroll Height': `${content.scrollHeight}px`,
    'Client Height': `${content.clientHeight}px`,
    'Scroll Width': `${content.scrollWidth}px`,
    'Client Width': `${content.clientWidth}px`
  });
}

/**
 * FUNCIÓN 3: Verificar botón flotante
 */
function checkFloatingButton() {
  const button = document.querySelector('.accessibility-button');
  const panel = document.getElementById('accessibility-panel');
  
  if (!button) {
    console.error('❌ Botón flotante no encontrado');
    return;
  }
  
  const style = window.getComputedStyle(button);
  const zIndex = style.zIndex;
  const panelZIndex = window.getComputedStyle(panel).zIndex;
  
  console.log(`%cZ-Index del botón flotante: ${zIndex}`, 'color: blue; font-weight: bold;');
  console.log(`%cZ-Index del panel: ${panelZIndex}`, 'color: blue;');
  console.log(`%cBotón está ENCIMA del panel: ${parseInt(zIndex) > parseInt(panelZIndex) ? '✅ SÍ' : '❌ NO'}`, 
    parseInt(zIndex) > parseInt(panelZIndex) ? 'color: green;' : 'color: red;');
  
  const rect = button.getBoundingClientRect();
  console.log(`%cPosición del botón:`, 'color: blue;');
  console.table({
    'Top': `${Math.round(rect.top)}px`,
    'Left': `${Math.round(rect.left)}px`,
    'Width': `${Math.round(rect.width)}px`,
    'Height': `${Math.round(rect.height)}px`,
    'Visible': rect.width > 0 && rect.height > 0 ? '✅ SÍ' : '❌ NO'
  });
}

/**
 * FUNCIÓN 4: Verificar botón "Restablecer Todo"
 */
function checkResetButton() {
  const resetBtn = document.querySelector('.accessibility-reset-all-btn');
  const panel = document.getElementById('accessibility-panel');
  const content = document.querySelector('.accessibility-panel-content');
  
  if (!resetBtn) {
    console.error('❌ Botón reset no encontrado');
    return;
  }
  
  // Verificar si está dentro o fuera del scroll
  const isInsideContent = content?.contains(resetBtn);
  
  console.log(`%cBotón "Restablecer Todo" está DENTRO del scroll: ${isInsideContent ? '❌ SÍ (PROBLEMA!)' : '✅ NO'}`,
    isInsideContent ? 'color: red; font-weight: bold;' : 'color: green;');
  
  console.log(`%cBotón está en el DOM del panel: ${panel?.contains(resetBtn) ? '✅ SÍ' : '❌ NO'}`,
    panel?.contains(resetBtn) ? 'color: green;' : 'color: red;');
  
  const rect = resetBtn.getBoundingClientRect();
  console.log(`%cPosición del botón reset:`, 'color: blue;');
  console.table({
    'Top': `${Math.round(rect.top)}px`,
    'Left': `${Math.round(rect.left)}px`,
    'Width': `${Math.round(rect.width)}px`,
    'Height': `${Math.round(rect.height)}px`,
    'Visible': rect.width > 0 && rect.height > 0 ? '✅ SÍ' : '❌ NO'
  });
}

/**
 * FUNCIÓN 5: Verificar word-wrap en botones
 */
function checkButtonWrapping() {
  const buttons = document.querySelectorAll('.accessibility-btn, .accessibility-reset-btn');
  console.log(`%cBotones encontrados: ${buttons.length}`, 'color: blue;');
  
  buttons.forEach((btn, index) => {
    const style = window.getComputedStyle(btn);
    const whiteSpace = style.whiteSpace;
    const wordBreak = style.wordBreak;
    const height = btn.offsetHeight;
    
    console.log(`%cBotón ${index + 1}:`, 'color: blue; font-weight: bold;');
    console.table({
      'white-space': whiteSpace,
      'word-break': wordBreak,
      'height': `${height}px`,
      'Height >= 2.5rem (40px)': height >= 40 ? '✅ SÍ' : '⚠️ NO'
    });
  });
}

/**
 * FUNCIÓN 6: Verificar media queries
 */
function checkMediaQueries() {
  const panel = document.getElementById('accessibility-panel');
  const style = window.getComputedStyle(panel);
  const maxHeight = style.maxHeight;
  
  console.log(`%cMax-height del panel: ${maxHeight}`, 'color: blue; font-weight: bold;');
  
  const windowHeight = window.innerHeight;
  console.log(`%cAltura de la ventana: ${windowHeight}px`, 'color: blue;');
  
  // Verificar que el panel es menor que la ventana
  const panelHeight = parseInt(maxHeight);
  const isResponsive = panelHeight < windowHeight;
  
  console.log(`%cPanel respeta el viewport: ${isResponsive ? '✅ SÍ' : '❌ NO'}`,
    isResponsive ? 'color: green;' : 'color: red;');
}

/**
 * FUNCIÓN 7: Test completo
 */
function runFullTest() {
  console.clear();
  console.log('%c========== TEST COMPLETO DEL PANEL ==========', 'color: black; background-color: #ffff00; font-size: 16px; font-weight: bold; padding: 10px;');
  
  console.log('\n📋 1. VERIFICANDO ESTRUCTURA...');
  checkResetButton();
  
  console.log('\n🔍 2. VERIFICANDO Z-INDEX...');
  checkFloatingButton();
  
  console.log('\n📏 3. VERIFICANDO SCROLL...');
  checkScroll();
  
  console.log('\n🔤 4. VERIFICANDO WORD-WRAP EN BOTONES...');
  checkButtonWrapping();
  
  console.log('\n📱 5. VERIFICANDO RESPONSIVE...');
  checkMediaQueries();
  
  console.log('\n%c========== TEST COMPLETADO ==========', 'color: black; background-color: #00ff00; font-size: 16px; font-weight: bold; padding: 10px;');
}

/**
 * FUNCIÓN 8: Test secuencial de tamaños
 */
function runSequentialFontTest() {
  console.clear();
  console.log('%c========== TEST SECUENCIAL DE TAMAÑOS ==========', 'color: black; background-color: #ffff00; font-size: 16px; font-weight: bold; padding: 10px;');
  
  const sizes = ['100%', '150%', '200%', '250%'];
  let currentIndex = 0;
  
  function testNext() {
    if (currentIndex >= sizes.length) {
      console.log('%c========== TEST TERMINADO ==========', 'color: black; background-color: #00ff00; font-size: 16px; font-weight: bold; padding: 10px;');
      console.log('Ejecuta runFullTest() para análisis detallado en el tamaño actual.');
      return;
    }
    
    const size = sizes[currentIndex];
    console.log(`\n%c\n📏 PROBANDO TAMAÑO: ${size}\n`, 'color: white; background-color: #0066cc; font-size: 14px; font-weight: bold; padding: 8px;');
    
    testFontSize(size);
    
    console.log('%c→ Si todo se ve bien, ejecuta: testNext()', 'color: purple; font-style: italic;');
    
    currentIndex++;
    window.testNext = testNext;
  }
  
  testNext();
}

/**
 * FUNCIÓN 9: Test de accesibilidad
 */
function checkAccessibility() {
  console.clear();
  console.log('%c========== TEST DE ACCESIBILIDAD ==========', 'color: black; background-color: #ffff00; font-size: 16px; font-weight: bold; padding: 10px;');
  
  const panel = document.getElementById('accessibility-panel');
  const buttons = document.querySelectorAll('.accessibility-btn, .accessibility-reset-btn, .accessibility-button');
  
  console.log(`%cPanel tiene ARIA labels: ${panel?.getAttribute('aria-label') ? '✅ SÍ' : '❌ NO'}`,
    panel?.getAttribute('aria-label') ? 'color: green;' : 'color: red;');
  
  console.log(`%cButtons con ARIA labels: ${buttons.length}`, 'color: blue;');
  
  let allHaveAriaLabel = true;
  buttons.forEach((btn, index) => {
    const hasLabel = btn.getAttribute('aria-label') || btn.textContent.trim().length > 0;
    if (!hasLabel) allHaveAriaLabel = false;
  });
  
  console.log(`%cTodos los botones son accesibles: ${allHaveAriaLabel ? '✅ SÍ' : '⚠️ NO'}`,
    allHaveAriaLabel ? 'color: green;' : 'color: orange;');
  
  // Verificar contraste (aproximado)
  console.log('%c→ Contraste debe verificarse manualmente con herramienta WAVE o similar', 'color: orange; font-style: italic;');
}

// ============================================
// GUÍA DE USO
// ============================================

console.log('%c\n' + 
  '╔══════════════════════════════════════════════════════════════╗\n' +
  '║     SCRIPT DE TESTING - PANEL DE ACCESIBILIDAD WEB           ║\n' +
  '╚══════════════════════════════════════════════════════════════╝\n' +
  '\n📖 FUNCIONES DISPONIBLES:\n' +
  '  1. testFontSize(size) - Cambia el tamaño de fuente\n' +
  '     Uso: testFontSize("150%")\n' +
  '     \n' +
  '  2. checkScroll() - Verifica scroll vertical/horizontal\n' +
  '     Uso: checkScroll()\n' +
  '     \n' +
  '  3. checkFloatingButton() - Verifica botón flotante\n' +
  '     Uso: checkFloatingButton()\n' +
  '     \n' +
  '  4. checkResetButton() - Verifica botón "Restablecer Todo"\n' +
  '     Uso: checkResetButton()\n' +
  '     \n' +
  '  5. checkButtonWrapping() - Verifica word-wrap en botones\n' +
  '     Uso: checkButtonWrapping()\n' +
  '     \n' +
  '  6. checkMediaQueries() - Verifica responsive\n' +
  '     Uso: checkMediaQueries()\n' +
  '     \n' +
  '  7. runFullTest() - Test COMPLETO actual\n' +
  '     Uso: runFullTest()\n' +
  '     \n' +
  '  8. runSequentialFontTest() - Test secuencial de tamaños\n' +
  '     Uso: runSequentialFontTest()\n' +
  '     \n' +
  '  9. checkAccessibility() - Verifica accesibilidad WCAG\n' +
  '     Uso: checkAccessibility()\n' +
  '\n✨ RECOMENDACIÓN:\n' +
  '   Para testing completo, ejecuta en orden:\n' +
  '   1. runFullTest()          (análisis actual)\n' +
  '   2. runSequentialFontTest() (prueba 100%-250%)\n' +
  '   3. checkAccessibility()    (verifica WCAG)\n' +
  '\n', 
  'color: #0066cc; font-size: 12px; font-family: monospace;'
);

// Auto-ejecutar información de ayuda
console.log('%cℹ️  Escribe: runFullTest() para comenzar', 'color: green; font-size: 14px; font-weight: bold;');
