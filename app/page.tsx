import { readFileSync } from 'node:fs';
import path from 'node:path';
import './landing.css';
import LandingScripts from './LandingScripts';

// El marcado de la landing vive en _landing/body.html (diseño original, sin cambios).
const html = readFileSync(path.join(process.cwd(), 'app', '_landing', 'body.html'), 'utf8');

export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <LandingScripts />
    </>
  );
}
