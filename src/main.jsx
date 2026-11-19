import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';
import { applyPrefs } from './uiPrefs.js';

applyPrefs();
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => applyPrefs());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

// Install-as-app (PWA): offline support in production builds only.
if (import.meta.env.PROD && 'serviceWorker' in navigator && (window.location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(window.location.hostname))) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => { /* offline support unavailable */ }); });
}
// Remember the browser's install prompt so an "Install app" button can show it later.
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.__installPrompt = e; window.dispatchEvent(new Event('upskillr-installable')); });
window.addEventListener('appinstalled', () => { window.__installPrompt = null; window.dispatchEvent(new Event('upskillr-installable')); });
