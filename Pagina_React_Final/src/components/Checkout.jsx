// src/components/Checkout.jsx
// Reemplaza a la sección #checkout completa del index.html original y a
// goStep2/backStep1/selectPay/formatCard/processPay/closeModal de main.js.
// Los 3 "steps" visuales y los 2 paneles (checkoutStep1/2) se controlan
// con un solo estado `step` en vez de display:none/block manual.

import { useState } from 'react';
import { formatPrice } from '../data/products';

const PAY_METHODS = ['Tarjeta Crédito', 'Tarjeta Débito', 'WebPay', 'Transferencia'];
const CITIES = ['Santiago', 'Valparaíso', 'Viña del Mar', 'Concepción', 'Antofagasta'];

export default function Checkout({ cart, total, onPaySuccess, toast }) {
  const [step, setStep] = useState(1); // 1 = datos/envío, 2 = pago
  const [showSuccess, setShowSuccess] = useState(false);

  const [ckName, setCkName] = useState('');
  const [ckLastname, setCkLastname] = useState('');
  const [ckEmail, setCkEmail] = useState('');
  const [ckPhone, setCkPhone] = useState('');
  const [ckAddr, setCkAddr] = useState('');
  const [ckCity, setCkCity] = useState(CITIES[0]);
  const [ckZip, setCkZip] = useState('');

  const [payMethod, setPayMethod] = useState(PAY_METHODS[0]);
  const [ckCard, setCkCard] = useState('');
  const [ckExp, setCkExp] = useState('');
  const [ckCvv, setCkCvv] = useState('');
  const [ckCardName, setCkCardName] = useState('');

  const goStep2 = () => {
    if (!ckName.trim() || !ckEmail.trim() || !ckAddr.trim()) {
      toast('Completa los datos de envío antes de continuar.');
      return;
    }
    setStep(2);
  };

  const backStep1 = () => setStep(1);

  // Igual que formatCard(el): agrupa de 4 en 4, máximo 16 dígitos
  const handleCardInput = (e) => {
    const digits = e.target.value.replace(/\D/g, '').substring(0, 16);
    setCkCard(digits.replace(/(\d{4})/g, '$1 ').trim());
  };

  const processPay = () => {
    const cardDigits = ckCard.replace(/\s/g, '');

    if (cardDigits.length < 16) {
      toast('Ingresa un número de tarjeta válido.');
      return;
    }
    if (!cart.length) {
      toast('Tu carrito está vacío.');
      return;
    }

    setShowSuccess(true);
  };

  const closeModal = () => {
    setShowSuccess(false);
    onPaySuccess(); // limpia el carrito (clearCart)
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="checkout">
      <div style={{ textAlign: 'center', padding: '0 40px 50px', maxWidth: 1300, margin: '0 auto' }}>
        <div className="section-tag">Compra Segura</div>
        <h2 className="section-title">Proceso de Pago</h2>
        <div className="section-line" />
      </div>
      <div className="checkout-container">
        <div>
          <div className="checkout-steps">
            <div className={`step${step === 1 ? ' active' : ''}`}>
              <span className="step-num">1</span> Datos
            </div>
            <div className="step-sep" />
            <div className={`step${step === 2 ? ' active' : ''}`} id="step2">
              <span className="step-num">2</span> Envío
            </div>
            <div className="step-sep" />
            <div className={`step${showSuccess ? ' active' : ''}`} id="step3">
              <span className="step-num">3</span> Pago
            </div>
          </div>

          {step === 1 && (
            <div id="checkoutStep1">
              <div className="checkout-form-title">Información Personal</div>
              <div className="form-row">
                <div className="checkout-group">
                  <label>Nombre</label>
                  <input type="text" placeholder="María" id="ckName" value={ckName} onChange={(e) => setCkName(e.target.value)} />
                </div>
                <div className="checkout-group">
                  <label>Apellido</label>
                  <input type="text" placeholder="González" id="ckLastname" value={ckLastname} onChange={(e) => setCkLastname(e.target.value)} />
                </div>
              </div>
              <div className="checkout-group">
                <label>Email</label>
                <input type="email" placeholder="tu@email.com" id="ckEmail" value={ckEmail} onChange={(e) => setCkEmail(e.target.value)} />
              </div>
              <div className="checkout-group">
                <label>Teléfono</label>
                <input type="tel" placeholder="+56 9 1234 5678" id="ckPhone" value={ckPhone} onChange={(e) => setCkPhone(e.target.value)} />
              </div>
              <div className="checkout-form-title" style={{ marginTop: 24 }}>
                Dirección de Envío
              </div>
              <div className="checkout-group">
                <label>Dirección</label>
                <input type="text" placeholder="Av. Apoquindo 1234" id="ckAddr" value={ckAddr} onChange={(e) => setCkAddr(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="checkout-group">
                  <label>Ciudad</label>
                  <select id="ckCity" value={ckCity} onChange={(e) => setCkCity(e.target.value)}>
                    {CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="checkout-group">
                  <label>Código Postal</label>
                  <input type="text" placeholder="7550000" id="ckZip" value={ckZip} onChange={(e) => setCkZip(e.target.value)} />
                </div>
              </div>
              <button className="btn-primary" style={{ width: '100%', border: 'none', marginTop: 8 }} onClick={goStep2}>
                Continuar al Pago →
              </button>
            </div>
          )}

          {step === 2 && (
            <div id="checkoutStep2">
              <div className="checkout-form-title">Método de Pago</div>
              <div className="pay-methods">
                {PAY_METHODS.map((m) => (
                  <div
                    key={m}
                    className={`pay-method${payMethod === m ? ' active' : ''}`}
                    onClick={() => setPayMethod(m)}
                  >
                    {m}
                  </div>
                ))}
              </div>
              <div className="checkout-group">
                <label>Número de Tarjeta</label>
                <input
                  type="text"
                  placeholder="1234 5678 9101 1121"
                  id="ckCard"
                  maxLength={19}
                  value={ckCard}
                  onChange={handleCardInput}
                />
              </div>
              <div className="form-row">
                <div className="checkout-group">
                  <label>Vencimiento</label>
                  <input type="text" placeholder="MM / AA" id="ckExp" maxLength={7} value={ckExp} onChange={(e) => setCkExp(e.target.value)} />
                </div>
                <div className="checkout-group">
                  <label>CVV</label>
                  <input type="text" placeholder="•••" id="ckCvv" maxLength={3} value={ckCvv} onChange={(e) => setCkCvv(e.target.value)} />
                </div>
              </div>
              <div className="checkout-group">
                <label>Nombre en la Tarjeta</label>
                <input type="text" placeholder="MARIA GONZALEZ" id="ckCardName" value={ckCardName} onChange={(e) => setCkCardName(e.target.value)} />
              </div>
              <div className="secure-badge">🔒 Pago 100% seguro · Encriptación SSL 256-bit · PCI DSS</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button className="btn-outline" style={{ border: '1px solid rgba(255,255,255,.2)' }} onClick={backStep1}>
                  ← Volver
                </button>
                <button className="btn-primary" style={{ flex: 1, border: 'none' }} onClick={processPay}>
                  Confirmar Compra · <span id="payTotal">{formatPrice(total)}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="order-summary">
          <div className="order-title">Resumen del Pedido</div>
          <div id="orderItems">
            {!cart.length ? (
              <p style={{ color: 'var(--gray)', fontSize: '.85em' }}>No hay productos en el carrito.</p>
            ) : (
              cart.map((x) => (
                <div className="order-item" key={x.id}>
                  <span>
                    {x.name} ×{x.qty}
                  </span>
                  <span>{formatPrice(x.price * x.qty)}</span>
                </div>
              ))
            )}
          </div>
          <div className="order-divider" />
          <div className="order-total-row">
            <span style={{ color: 'var(--gray)', fontSize: '.85em' }}>Subtotal</span>
            <span id="oSubtotal">{formatPrice(total)}</span>
          </div>
          <div className="order-total-row">
            <span style={{ color: 'var(--gray)', fontSize: '.85em' }}>Envío</span>
            <span style={{ color: '#4caf50', fontSize: '.85em' }}>Gratis</span>
          </div>
          <div className="order-total-row final">
            <span>Total</span>
            <span id="oTotal">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="modal-overlay open" id="successModal">
          <div className="modal">
            <div className="modal-icon">✓</div>
            <h3>¡Compra Exitosa!</h3>
            <p>Tu pedido ha sido procesado correctamente. Recibirás un correo de confirmación con el número de seguimiento.</p>
            <button className="btn-primary" style={{ border: 'none', width: '100%' }} onClick={closeModal}>
              Volver al Inicio
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
