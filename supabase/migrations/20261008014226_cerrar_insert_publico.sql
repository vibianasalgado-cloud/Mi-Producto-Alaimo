-- Los formularios ahora escriben desde las rutas de servidor de Next.js
-- (llave secreta, que se salta RLS). Se cierra el insert directo con la llave pública.
drop policy "visitantes insertan" on public.signups;
drop policy "visitantes insertan" on public.feedback;
