# Resumen de Cambios — ViceLeteChile (React + Vite)

> Consolidado a partir de los 18 archivos `.md` encontrados en el proyecto (`MIGRACION.md`, `CAMBIOS_REALIZADOS.md`, `CHANGELOG_ACCESSIBILITY_FIXES.md`, `RESUMEN_FINAL.md`, `VERIFICACION_FINAL.md`, `CHECKLIST_COMPLETO.md`, `ACCESSIBILITY_*.md`, `QUICK_*.md`, `PRUEBA_RAPIDA.md`, `INDICE_DOCUMENTACION.md`) más una revisión directa del código fuente actual en `src/`.

---

## 1. Migración de sitio estático (HTML/CSS/JS) a React + Vite

Fuente: `MIGRACION.md`. Estado declarado: **migración funcional completa**, build verificado (`vite build` → 37 módulos, sin errores).

### Arreglos de fundación
- `index.html`: favicon corregido a `/imagenes/logo/logo.svg`; eliminado un `<link>` de CSS roto que apuntaba a una ruta inexistente.
- `main.jsx`: ahora importa el CSS real del sitio (`./styles/estilo_pag_rop.css`) en lugar del `index.css` boilerplate de Vite (que traía `#root{width:1126px}` y rompía el layout full-width).
- Imágenes movidas de `src/assets/imagenes` a `public/imagenes/` para que las rutas absolutas `/imagenes/...` usadas en `products.js` funcionen.
- Eliminados: `src/index.css`, `src/App.css` (boilerplate Vite), `src/assets/` completo (duplicado), y los 3 `Formulario_de_*.js` originales que estaban copiados sin migrar dentro de `src/components/`.
- Confirmados los nombres reales de imágenes de categoría: `casual.jpg`, `formal.jpg`, `deportiva.jpg`, `lujo.jpg`.

### Componentes nuevos (`src/components/`)
| Componente | Función |
|---|---|
| `Header.jsx`, `Hero.jsx`, `Footer.jsx` | Secciones estáticas migradas 1:1 desde el HTML original |
| `CategoryCarousel.jsx` | Carrusel de categorías conectado a `useCarousel`; filtra el grid al hacer click |
| `ProductGrid.jsx` | Grid de productos + botones de filtro por categoría + selector de orden |
| `AuthSection.jsx` | Login/registro con tabs vía `useState` (antes manipulaba el DOM); conectado a `useAuth` |
| `ContactForm.jsx` | Formulario de contacto con validación |
| `Checkout.jsx` | Flujo de 2 pasos (datos/envío → pago) + modal de éxito, formateo de tarjeta en vivo, selección de método de pago, resumen de orden en tiempo real |
| `Toasts.jsx` | Notificaciones; reemplaza el `toast()` original que usaba `createElement` |
| `CartDrawer.jsx` | Panel lateral del carrito; reemplaza el `updateCart()` que llenaba el DOM con `innerHTML` |

### Hooks nuevos (`src/hooks/`)
- **`useAuth.js`**: migra `registrarUsuario` / `iniciarSesion` / `cerrarSesion`, persiste en `localStorage` bajo las mismas claves originales (`Lete_usuarios_v1`, `Lete_sesion_v1`) para no perder datos de usuarios previos.
- **`useFavorites.js`**: favoritos con `Set`, dispara toast al agregar.
- **`useProductFilters.js`**: filtro por categoría + orden (precio asc/desc, nuevo ingreso), con `useMemo`.
- **`useToasts.js`**: cola de notificaciones con animación de entrada/salida (requirió la clase `.toast.leaving` en el CSS).
- **`useCarousel.js`**: ya existía, sin cambios.
- **`useCart.js`**: extendido con `clearCart` (para el checkout) y callback de toast al agregar producto.

### Utilidades (`src/utils/`)
- **`validation.js`**: migra `sanitizeInput`, `validateEmail`, `validatePassword`, `validarDatos` desde `Formulario_de_Registro.js` original, como funciones puras (sin `window.*` ni DOM).

### CSS
- Única regla nueva agregada a `estilo_pag_rop.css`: `.toast.leaving{animation:slideIn .3s ease reverse}` para reproducir en CSS la animación de salida que antes se hacía manipulando `style.animation` desde JS. El resto del archivo es idéntico al original.

### Pendientes señalados por la migración (no resueltos, documentados como comportamiento heredado)
- Carrito, favoritos y filtro de productos **no persisten** en `localStorage` (igual que el sitio original).
- Sin protección de rutas: cualquiera puede ver `#checkout` sin iniciar sesión.
- Contraseñas guardadas en texto plano en `localStorage` vía `useAuth` (replica el comportamiento original; no apto para producción real sin backend con hash server-side).
- Sin React Router: navegación por anchors (`#inicio`, `#catalogo`, etc.) sobre página única, igual que el original.

---

## 2. Sistema de Accesibilidad (feature nueva)

Fuente: `ACCESSIBILITY_SUMMARY.md` y documentos relacionados (`ACCESSIBILITY_README.md`, `ACCESSIBILITY_GUIDE.md`, `ACCESSIBILITY_CHEATSHEET.md`, `ACCESSIBILITY_TESTING.md`, `ACCESSIBILITY_INDEX.md`, `ACCESSIBILITY_ADVANCED_EXAMPLES.md`).

### Archivos creados
- `src/components/AccessibilityMenu.jsx` (actualmente 463 líneas)
- `src/styles/accessibility.css` (actualmente 728 líneas)
- `src/hooks/useAccessibility.js` (111 líneas)

### Archivo modificado
- `src/App.jsx`: integra `<AccessibilityMenu />` como elemento flotante global.

### Funcionalidades implementadas
- **Botón flotante** circular, esquina inferior derecha, visible en todas las páginas; cambia a "X" cuando el panel está abierto.
- **Tamaño de texto**: ajuste de 10% en 10%, rango 80%–200%, botón de restablecer.
- **Contraste**: Normal / Alto Contraste / Invertido / Escala de Grises.
- **Legibilidad**: espaciado de letras (0–10px), altura de línea (1.0–3.0), fuente para dislexia (OpenDyslexic).
- **Navegación y comodidad visual**: resaltar enlaces, resaltar encabezados, cursor grande, detener animaciones.
- **Persistencia**: configuración guardada automáticamente en `localStorage`, botón "Restablecer Todo".
- **Diseño**: CSS variables, 4 breakpoints responsive, modo oscuro automático.
- **Cumplimiento WCAG 2.1 Level AA**: ARIA labels, navegación por teclado, focus visible, contraste mínimo 4.5:1, jerarquía HTML semántica.

---

## 3. Fixes al panel de accesibilidad (texto grande / superposición)

Fuente: `CAMBIOS_REALIZADOS.md`, `CHANGELOG_ACCESSIBILITY_FIXES.md`, `RESUMEN_FINAL.md`, `VERIFICACION_FINAL.md`, `CHECKLIST_COMPLETO.md` (contenido duplicado entre sí; consolidado aquí una sola vez). Fecha declarada: junio 2026.

Se identificaron y resolvieron **3 problemas** cuando el usuario aumentaba el tamaño de fuente del navegador:

### Problema 1 — Panel crecía indefinidamente con texto grande
Archivo: `src/styles/accessibility.css`
```diff
.accessibility-panel {
- max-height: 80vh;
+ max-height: calc(100vh - 10rem);
+ display: flex;
+ flex-direction: column;
+ overflow: hidden;
}

.accessibility-panel-content {
- max-height: 100%;
+ flex: 1;
+ min-height: 0;
+ overflow-x: hidden;
  overflow-y: auto;
}
```
También se actualizaron las media queries (768px, 1024px, 480px) para usar alturas dinámicas (`calc(100vh - Xrem)`) en vez de porcentajes fijos del viewport.

### Problema 2 — Botón "Restablecer Todo" tapaba el botón flotante
Archivo: `src/styles/accessibility.css`
```diff
.accessibility-button {
- z-index: 9998;
+ z-index: 2147483647;  /* máximo z-index posible */
+ flex-shrink: 0;
}

.accessibility-panel {
- z-index: 9999;
+ z-index: 10000;
}
```
Archivo: `src/components/AccessibilityMenu.jsx` — se reorganizó el JSX para sacar el botón "Restablecer Todas las Configuraciones" de adentro de `.accessibility-panel-content` (donde se scrolleaba) y dejarlo como hijo directo de `.accessibility-panel`, fuera del área scrollable y siempre visible.

### Problema 3 — Botones/títulos no hacían wrap con texto grande (200%+)
Archivo: `src/styles/accessibility.css`
```diff
.accessibility-btn,
.accessibility-reset-btn {
- white-space: nowrap;
+ white-space: normal;
+ word-break: break-word;
+ overflow-wrap: break-word;
+ min-height: 2.5rem;
+ display: flex;
+ align-items: center;
+ justify-content: center;
+ flex: 1 1 auto;
}

.accessibility-section h3,
.accessibility-subsection label {
+ word-break: break-word;
+ overflow-wrap: break-word;
+ line-height: 1.3–1.4;
}

.accessibility-value {
- display: inline-block;
+ display: inline-flex;
+ padding / background-color / flex: 1 1 auto añadidos
}

.accessibility-reset-all-btn {
+ min-height: 2.5rem; flex-shrink: 0; margin-bottom; word-break; overflow-wrap; display: flex
}
```
Se agregó además una sección nueva **"GARANTÍAS DE CONTENIMIENTO"** con `box-sizing: border-box` y `overflow: hidden` aplicados a contenedores (`.accessibility-controls`, `.accessibility-section`, `.accessibility-subsection`) y `max-width: 100%` en sliders, labels y títulos, para eliminar el scroll horizontal en cualquier escenario.

### Resultado verificado (tabla de compatibilidad)
| Tamaño de texto | Panel | Scroll vertical | Scroll horizontal | Botón flotante | Botones con wrap |
|---|---|---|---|---|---|
| 100% | ✅ | N/A | ❌ | ✅ | N/A |
| 150% | ✅ | ✅ | ❌ | ✅ | ✅ |
| 200% | ✅ | ✅ | ❌ | ✅ | ✅ |
| 250%+ | ✅ | ✅ | ❌ | ✅ | ✅ |

**Alcance de los fixes:** 2 archivos modificados (`accessibility.css`, `AccessibilityMenu.jsx`), ~50 líneas, 0 funcionalidades nuevas, 100% de funcionalidad original preservada, WCAG 2.1 AA mantenido.

---

## 4. Otros documentos de la carpeta (sin cambios de código adicionales)

Estos `.md` son guías de referencia/uso y no describen cambios de código distintos a los ya listados arriba — se omiten del detalle técnico para no duplicar contenido:
- `ACCESSIBILITY_README.md`, `ACCESSIBILITY_GUIDE.md`, `ACCESSIBILITY_CHEATSHEET.md`, `ACCESSIBILITY_TESTING.md`, `ACCESSIBILITY_INDEX.md`, `ACCESSIBILITY_ADVANCED_EXAMPLES.md` — documentación de uso, ejemplos de extensión (hooks de analytics, perfiles rápidos, validador de contraste WCAG) y guía de pruebas manuales del sistema de accesibilidad.
- `QUICK_START.md`, `QUICK_REF.md`, `PRUEBA_RAPIDA.md` — guías rápidas de instalación/prueba (`npm install`, `npm run dev`) y checklist de verificación manual.
- `INDICE_DOCUMENTACION.md` — índice de navegación entre todos los `.md` del proyecto.
- `README.md` — boilerplate estándar de Vite + React (sin contenido propio del proyecto).

---

## 5. Revisión adicional del código fuente (más allá de lo documentado en los .md)

Verificación directa de `src/` para detectar código no cubierto explícitamente por la documentación:

- **`src/App.jsx`** actúa como punto de unión central: reemplaza `index.html` + `main.js` originales. El estado global (carrito, favoritos, auth, filtros, toasts) vive en hooks y se pasa por props, replicando lo que antes eran variables globales (`cart`, `favs`, `sesion`, `filtered`) accesibles desde cualquier función de `main.js`.
- **`CartDrawer.jsx`** no aparece mencionado explícitamente en la lista de componentes nuevos de `MIGRACION.md`, pero su propio comentario de cabecera confirma que reemplaza el bloque `<div class="cart-drawer">` y la función `updateCart()` con `innerHTML` del sitio original — coherente con el resto de la migración, solo faltó listarlo en la documentación.
- **Tamaño actual de los archivos clave de accesibilidad** (confirmado por conteo de líneas, no documentado numéricamente en ningún `.md`):
  - `AccessibilityMenu.jsx`: 463 líneas
  - `accessibility.css`: 728 líneas
  - `useAccessibility.js`: 111 líneas
- **`.gitignore`** está presente pero el proyecto **no tiene historial de Git** inicializado (`.git` no existe en el zip), por lo que no fue posible contrastar contra commits reales; este resumen se basa en el contenido de los `.md` y el estado final del código.
- No se detectó código fuente sin documentar fuera de lo ya cubierto (componentes, hooks y utils coinciden 1:1 con lo descrito en `MIGRACION.md` y los `.md` de accesibilidad).

---

## Resumen ejecutivo (una línea por etapa)

1. **Migración** de sitio estático a React + Vite con arquitectura de componentes/hooks, preservando comportamiento y datos de `localStorage` existentes.
2. **Sistema de accesibilidad** nuevo (botón flotante + panel con 8 categorías de ajustes, WCAG 2.1 AA, persistente en `localStorage`).
3. **Fixes quirúrgicos** (2 archivos, ~50 líneas) para que el panel de accesibilidad funcione correctamente con texto ampliado hasta 250%+, sin overlaps ni scroll horizontal.
