// src/components/Toasts.jsx
// Reemplaza al contenedor #toastWrap que main.js llenaba con
// document.createElement + appendChild.

export default function Toasts({ toasts }) {
  return (
    <div className="toast-wrap" id="toastWrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.leaving ? ' leaving' : ''}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
