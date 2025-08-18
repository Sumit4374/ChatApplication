import React, { useEffect, useState } from 'react';

export default function DevOverlay() {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    function push(msg) {
      setErrors((prev) => [...prev, msg].slice(-5));
    }
    const onError = (event) => {
      push(`Error: ${event.message || event.reason || event}`);
    };
    const onRejection = (event) => {
      push(`Unhandled: ${event.reason?.message || String(event.reason || event)}`);
    };
    const origError = console.error;
    console.error = function (...args) {
      try { push(args.map(String).join(' ')); } catch {}
      origError.apply(console, args);
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      console.error = origError;
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  if (errors.length === 0) return null;
  return (
    <div style={{ position: 'fixed', bottom: 8, left: 8, zIndex: 100000, maxWidth: '80vw', background: '#222', color: '#fff', padding: '8px 10px', borderRadius: 6, fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Client errors</div>
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {errors.map((e, i) => (
          <li key={i} style={{ marginBottom: 4, whiteSpace: 'pre-wrap' }}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
