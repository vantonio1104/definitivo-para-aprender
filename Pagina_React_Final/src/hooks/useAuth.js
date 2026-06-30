// src/hooks/useAuth.js
// Reemplaza a las secciones 1 y 6 de main.js:
// - `usuarios`, `sesion` (variables globales) -> estado de React
// - loadState/saveState (localStorage) -> useEffect de carga + guardado
// - registrarUsuario / iniciarSesion / cerrarSesion -> funciones del hook
//
// Mismas claves de localStorage que el original, para no perder datos
// de usuarios que ya se hayan registrado con la versión vieja del sitio.

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'Lete_usuarios_v1';
const SESSION_KEY = 'Lete_sesion_v1';

function loadUsuarios() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('No se pudo cargar usuarios:', e);
    return [];
  }
}

function loadSesion() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === 'object') {
      return { activo: !!parsed.activo, usuario: parsed.usuario || null };
    }
  } catch (e) {
    console.warn('No se pudo cargar sesión:', e);
  }
  return { activo: false, usuario: null };
}

export function useAuth() {
  const [usuarios, setUsuarios] = useState(loadUsuarios);
  const [sesion, setSesion] = useState(loadSesion);

  // Persistir cada vez que cambian usuarios o sesión (equivalente a saveState())
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
    } catch (e) {
      console.warn('No se pudo guardar usuarios:', e);
    }
  }, [usuarios]);

  useEffect(() => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
    } catch (e) {
      console.warn('No se pudo guardar sesión:', e);
    }
  }, [sesion]);

  const registrarUsuario = useCallback((datos) => {
    const usuario = {
      id: Date.now(),
      nombre: String(datos.nombre || '').trim(),
      email: String(datos.email || '').trim().toLowerCase(),
      password: String(datos.password || ''),
      fechaRegistro: new Date().toISOString(),
      rol: 'user',
    };
    setUsuarios((prev) => [...prev, usuario]);
    return usuario;
  }, []);

  const iniciarSesion = useCallback(
    (email, pass) => {
      const emailNorm = String(email || '').trim().toLowerCase();
      const usuario = usuarios.find((u) => u.email === emailNorm && u.password === String(pass || ''));

      if (!usuario) {
        return { success: false, mensaje: 'Email o contraseña incorrectos.' };
      }

      setSesion({ activo: true, usuario });
      return { success: true, usuario };
    },
    [usuarios]
  );

  const cerrarSesion = useCallback(() => {
    setSesion({ activo: false, usuario: null });
  }, []);

  return { sesion, registrarUsuario, iniciarSesion, cerrarSesion };
}
