'use client';

import { useEffect } from 'react';

// Sin interfaz: avisa al servidor que el usuario entró hoy.
export default function RegistrarVisita() {
  useEffect(() => {
    fetch('/api/visitas', { method: 'POST' }).catch(() => {});
  }, []);
  return null;
}
