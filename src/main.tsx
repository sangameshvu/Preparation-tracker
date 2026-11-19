import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Purge any injected Netlify drawer/feedback watermark elements from DOM immediately
const purgeNetlifyDrawer = () => {
  if (typeof document === 'undefined') return;
  const elements = document.querySelectorAll(
    'netlify-drawer, [data-netlify-drawer], #netlify-drawer, .netlify-drawer, [data-netlify-deploy-preview-badge], #netlify-preview-badge, iframe[src*="netlify"], div[class*="netlify-drawer"], div[class*="NetlifyDrawer"], div[id*="netlify-drawer"]'
  );
  elements.forEach((el) => {
    try {
      el.remove();
    } catch {
      // ignore
    }
  });
};

purgeNetlifyDrawer();
if (typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver(() => purgeNetlifyDrawer());
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
