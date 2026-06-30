// src/components/AuthSection.jsx
// Reemplaza a la sección #perfil completa del index.html original
// (auth-tabs, loginForm, registerForm) y a los handlers handleLogin/
// handleRegister/switchTab de main.js, más las validaciones de
// Formulario_de_Login.js / Formulario_de_Registro.js.
// Usa useState en vez de manipulación directa del DOM.

import { useState } from 'react';
import { sanitizeInput, validarDatos } from '../utils/validation';

export default function AuthSection({ sesion, iniciarSesion, registrarUsuario, cerrarSesion, toast }) {
  const [tab, setTab] = useState('login');

  // --- Login ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginErrors, setLoginErrors] = useState({});
  const [loginMsg, setLoginMsg] = useState({ text: '', isError: false });

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginErrors({});
    setLoginMsg({ text: '', isError: false });

    const email = sanitizeInput(loginEmail);
    const password = String(loginPass);
    const result = iniciarSesion(email, password);

    if (!result.success) {
      setLoginErrors({ email: result.mensaje, pass: result.mensaje });
      setLoginMsg({ text: result.mensaje, isError: true });
      return;
    }

    setLoginMsg({ text: `¡Bienvenido de vuelta, ${result.usuario.nombre}!`, isError: false });
    toast('Sesión iniciada correctamente ✓');
  };

  // --- Registro ---
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPass2, setRegPass2] = useState('');
  const [regErrors, setRegErrors] = useState({});
  const [regMsg, setRegMsg] = useState({ text: '', isError: false });

  const handleRegister = (e) => {
    e.preventDefault();
    setRegErrors({});
    setRegMsg({ text: '', isError: false });

    const name = sanitizeInput(regName);
    const email = sanitizeInput(regEmail);
    const password = String(regPass);
    const confirmPassword = String(regPass2);

    const result = validarDatos({ nombre: name, email, password, confirmPassword });

    if (!result.valid) {
      setRegErrors(result.errors);
      setRegMsg({ text: 'Corrige los campos e intenta de nuevo.', isError: true });
      return;
    }

    registrarUsuario({ nombre: name, email, password });
    setRegMsg({ text: '¡Cuenta creada exitosamente! Bienvenido/a.', isError: false });
    toast('Cuenta creada. ¡Bienvenido/a a ViceLete! ✓');

    setRegName('');
    setRegEmail('');
    setRegPass('');
    setRegPass2('');
  };

  return (
    <section id="perfil">
      <div className="auth-container">
        <div className="auth-info">
          <h2>
            Acceso
            <br />
            Exclusivo
          </h2>
          {sesion.activo ? (
            <p style={{ color: 'var(--gray)', lineHeight: 1.8, marginBottom: 30 }}>
              Sesión activa como <strong style={{ color: 'var(--cyan)' }}>{sesion.usuario?.nombre}</strong>.{' '}
              <a href="#perfil" onClick={cerrarSesion} style={{ color: 'var(--cyan)' }}>
                Cerrar sesión
              </a>
            </p>
          ) : (
            <p style={{ color: 'var(--gray)', lineHeight: 1.8, marginBottom: 30 }}>
              Únete a la comunidad ViceLete Chile y accede a beneficios únicos, descuentos especiales y
              preventas de colecciones exclusivas.
            </p>
          )}
          <ul className="auth-features">
            <li>Descuentos exclusivos para miembros</li>
            <li>Acceso anticipado a nuevas colecciones</li>
            <li>Programa de puntos ViceLete</li>
            <li>Envío express gratuito en compras +$200.000</li>
            <li>Asesoría de imagen personalizada</li>
          </ul>
        </div>
        <div className="auth-box">
          <div className="auth-tabs">
            <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>
              Iniciar Sesión
            </button>
            <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => setTab('register')}>
              Registrarse
            </button>
          </div>

          <form className={`auth-form${tab === 'login' ? ' active' : ''}`} id="loginForm" noValidate onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="loginEmail">Correo Electrónico</label>
              <input
                type="email"
                placeholder="tu@email.com"
                id="loginEmail"
                name="loginEmail"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <div className="auth-msg field-error" id="loginEmailError">{loginErrors.email}</div>
            </div>
            <div className="form-group">
              <label htmlFor="loginPass">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                id="loginPass"
                name="loginPass"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
              />
              <div className="auth-msg field-error" id="loginPassError">{loginErrors.pass}</div>
            </div>
            <button className="btn-primary" type="submit" style={{ width: '100%', border: 'none' }}>
              Ingresar
            </button>
            <div className="auth-msg" id="loginMsg" style={{ color: loginMsg.isError ? '#ff6b6b' : 'var(--cyan)' }}>
              {loginMsg.text}
            </div>
            <div className="form-divider">o</div>
            <p style={{ textAlign: 'center', fontSize: '.78em', color: 'var(--gray)' }}>
              ¿Olvidaste tu contraseña?{' '}
              <a href="#" style={{ color: 'var(--cyan)' }}>
                Recuperar acceso
              </a>
            </p>
          </form>

          <form className={`auth-form${tab === 'register' ? ' active' : ''}`} id="registerForm" noValidate onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="regName">Nombre Completo</label>
              <input
                type="text"
                placeholder="Tu nombre"
                id="regName"
                name="regName"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
              <div className="auth-msg field-error" id="regNameError">{regErrors.nombre}</div>
            </div>
            <div className="form-group">
              <label htmlFor="regEmail">Correo Electrónico</label>
              <input
                type="email"
                placeholder="tu@email.com"
                id="regEmail"
                name="regEmail"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
              <div className="auth-msg field-error" id="regEmailError">{regErrors.email}</div>
            </div>
            <div className="form-group">
              <label htmlFor="regPass">Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                id="regPass"
                name="regPass"
                value={regPass}
                onChange={(e) => setRegPass(e.target.value)}
              />
              <div className="auth-msg field-error" id="regPassError">{regErrors.password}</div>
            </div>
            <div className="form-group">
              <label htmlFor="regPass2">Confirmar Contraseña</label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                id="regPass2"
                name="regPass2"
                value={regPass2}
                onChange={(e) => setRegPass2(e.target.value)}
              />
              <div className="auth-msg field-error" id="regPass2Error">{regErrors.confirmPassword}</div>
            </div>
            <button className="btn-primary" type="submit" style={{ width: '100%', border: 'none' }}>
              Crear Cuenta
            </button>
            <div className="auth-msg" id="registerMsg" style={{ color: regMsg.isError ? '#ff6b6b' : 'var(--cyan)' }}>
              {regMsg.text}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
