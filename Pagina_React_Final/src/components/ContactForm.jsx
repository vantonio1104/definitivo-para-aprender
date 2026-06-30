// src/components/ContactForm.jsx
// Reemplaza a la sección #contacto del index.html original y a
// handleContact() de main.js + Formulario_de_Contacto.js.

import { useState } from 'react';
import { sanitizeInput, validarDatos } from '../utils/validation';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ text: '', isError: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setMsg({ text: '', isError: false });

    const cleanName = sanitizeInput(name);
    const cleanEmail = sanitizeInput(email);
    const cleanMessage = sanitizeInput(message);

    const result = validarDatos({ nombre: cleanName, email: cleanEmail, message: cleanMessage });

    if (!result.valid) {
      setErrors(result.errors);
      setMsg({ text: 'Corrige los campos e intenta de nuevo.', isError: true });
      return;
    }

    setMsg({ text: 'Mensaje enviado con éxito. Gracias por contactarnos.', isError: false });
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <section id="contacto" className="section">
      <div className="section-header">
        <div className="section-tag">Contacto</div>
        <h2 className="section-title">Escríbenos</h2>
        <div className="section-line" />
      </div>
      <form id="contactoForm" className="contact-form" noValidate onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="contactName">Nombre Completo</label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="auth-msg field-error" id="contactNameError">{errors.nombre}</div>
        </div>
        <div className="form-group">
          <label htmlFor="contactEmail">Correo Electrónico</label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="auth-msg field-error" id="contactEmailError">{errors.email}</div>
        </div>
        <div className="form-group">
          <label htmlFor="contactMessage">Mensaje</label>
          <textarea
            id="contactMessage"
            name="contactMessage"
            rows="5"
            placeholder="Escribe tu mensaje"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="auth-msg field-error" id="contactMessageError">{errors.message}</div>
        </div>
        <button className="btn-primary" type="submit" style={{ width: '100%', border: 'none' }}>
          Enviar Mensaje
        </button>
        <div className="auth-msg" id="contactMsg" style={{ color: msg.isError ? '#ff6b6b' : 'var(--cyan)' }}>
          {msg.text}
        </div>
      </form>
    </section>
  );
}
