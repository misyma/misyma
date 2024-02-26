import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, RouterProvider, NotFoundRoute } from '@tanstack/react-router';
import './i18n.ts';
import './index.css';
import { rootRoute } from './routes/root.tsx';
import { routeTree } from './core/router/router.tsx';
import { QueryClientProvider } from './core/components/providers/queryClientProvider.tsx';
import { Provider } from 'react-redux';
import { store } from './core/store/store.ts';

const notFoundRoute = new NotFoundRoute({
  getParentRoute: () => rootRoute,
  component: () => '404 Not Found',
});

const router = createRouter({
  routeTree,
  notFoundRoute,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
