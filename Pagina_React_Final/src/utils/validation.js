// src/utils/validation.js
// Migrado desde js/Formulario_de_Registro.js (sanitizeInput, validateEmail,
// validatePassword, validarDatos). Funciones puras, sin tocar el DOM.

export function sanitizeInput(value) {
  return String(value || '')
    .trim()
    .replace(/[<>]/g, (char) => (char === '<' ? '&lt;' : '&gt;'));
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email || '').trim());
}

export function validatePassword(password) {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return typeof password === 'string' && passwordRegex.test(password);
}

export function passwordsMatch(p1, p2) {
  return String(p1 || '') === String(p2 || '');
}

/**
 * Validación genérica de formularios (login, registro, contacto).
 * Devuelve { valid, errors } donde errors es un objeto { campo: mensaje },
 * más práctico en React que el array original de main.js.
 */
export function validarDatos(formData) {
  const errors = {};
  const texto = (value) => String(value || '').trim();

  if ('nombre' in formData && !texto(formData.nombre)) {
    errors.nombre = 'Completa tu nombre.';
  }

  if ('email' in formData && !validateEmail(formData.email)) {
    errors.email = 'Ingresa un email válido.';
  }

  if ('password' in formData && !validatePassword(formData.password)) {
    errors.password = 'La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.';
  }

  if ('confirmPassword' in formData && formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  if ('message' in formData && texto(formData.message).length < 10) {
    errors.message = 'El mensaje debe tener al menos 10 caracteres.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
