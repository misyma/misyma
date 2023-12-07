import React from 'react';
import ReactDOM from 'react-dom/client';

import './i18n.ts';

import App from './App.tsx';
import './index.css';
import { ConfigProvider } from './config/configProvider.ts';

async function enableMocking() {
  if (ConfigProvider.getNodeEnv() !== 'development') {
    return;
  }

  const { worker } = await import('./mocks/worker.ts');

  return await worker.start();
}

await enableMocking();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
