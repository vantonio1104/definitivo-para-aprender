// src/hooks/useEmailJS.js
// Hook personalizado que encapsula la lógica de envío de correos con EmailJS.
// Se llama desde Checkout (confirmación de pedido).
//
// IMPORTANTE: Este hook NO bloquea el flujo principal.
// Si el correo falla (red caída, límite superado, variables mal configuradas),
// el usuario igual compra. El error solo se muestra en consola.
//
// Variables de entorno requeridas en el archivo .env:
//   VITE_EMAILJS_SERVICE_ID           → ID del servicio Gmail
//   VITE_EMAILJS_TEMPLATE_PEDIDO      → Template de confirmación de compra
//   VITE_EMAILJS_PUBLIC_KEY           → Clave pública de EmailJS
//

import { useCallback } from 'react';
import emailjs from '@emailjs/browser';

// Leemos las variables de entorno de Vite (solo disponibles en build time)
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_PEDIDO = import.meta.env.VITE_EMAILJS_TEMPLATE_PEDIDO;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Revisa si las variables base están configuradas
const emailjsConfigurado = SERVICE_ID && PUBLIC_KEY;

if (!emailjsConfigurado) {
  console.warn(
    '[useEmailJS] Variables de entorno no configuradas. ' +
    'Crea un archivo .env con las claves VITE_EMAILJS_*. ' +
    'El sistema seguirá funcionando sin envío de correos.'
  );
}

export function useEmailJS() {

  // ── Correo de CONFIRMACIÓN DE PEDIDO ─────────────────────────────────────
  /**
   * Envía el comprobante de compra al email del cliente.
   *
   * @param {object} pedido - Datos armados en Checkout.jsx:
   *   {
   *     nombre_cliente  : string   (nombre + apellido)
   *     email_cliente   : string   (email del form de envío)
   *     telefono        : string
   *     direccion       : string   (dirección + ciudad + código postal)
   *     metodo_pago     : string   (ej: "Tarjeta Crédito")
   *     numero_pedido   : string   (generado con Date.now())
   *     fecha_pedido    : string   (fecha/hora en es-CL)
   *     items_texto     : string   (lista de productos formateada como texto plano)
   *     subtotal        : string   (precio formateado)
   *     envio           : string   (siempre "Gratis" por ahora)
   *     total           : string   (precio formateado)
   *   }
   * @returns {Promise<boolean>} true si el correo se envió, false si falló
   */
  const enviarCorreoPedido = useCallback(async (pedido) => {
    if (!emailjsConfigurado || !TEMPLATE_PEDIDO) return false;

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_PEDIDO, pedido, {
        publicKey: PUBLIC_KEY,
      });
      console.info('[EmailJS] Correo de pedido enviado a', pedido.email_cliente);
      return true;
    } catch (error) {
      console.error('[EmailJS] Error al enviar correo de pedido:', error);
      return false;
    }
  }, []);

  return { enviarCorreoPedido };
}
