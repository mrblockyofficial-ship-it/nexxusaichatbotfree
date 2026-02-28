import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// IMPORTANT NOTICE:
// True security requires a backend proxy. Frontend env variables are NOT fully secure.
// This is a frontend-only application as requested.

// Hide sensitive logs in production mode
if (import.meta.env.PROD) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  // Keep console.error and console.warn for critical issues
}

// Basic anti-inspect obfuscation (deterrent only)
if (import.meta.env.PROD) {
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && e.key === 'I') ||
      (e.ctrlKey && e.shiftKey && e.key === 'J') ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
