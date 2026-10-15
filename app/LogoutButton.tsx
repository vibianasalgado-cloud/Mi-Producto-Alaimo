'use client';

export default function LogoutButton() {
  async function salir() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.assign('/login');
  }
  return (
    <button type="button" className="btn btn-ghost" onClick={salir}>
      Cerrar sesión
    </button>
  );
}
