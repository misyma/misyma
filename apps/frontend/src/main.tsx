import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import './i18n.ts';
import './index.css';
import { routeTree } from './core/router/router.tsx';
import { QueryClientProvider } from './core/components/providers/queryClientProvider/queryClientProvider.tsx';
import { notFoundRoute } from './routes/notFound/notFound.tsx';
import { StoreProvider } from './core/components/providers/storeProvider/storeProvider.tsx';
import { SearchCreateBookProvider } from './routes/bookshelf/search/context/searchCreateBookContext.tsx';

const router = createRouter({
  routeTree,
  notFoundRoute,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <QueryClientProvider>
        <SearchCreateBookProvider>
          <RouterProvider router={router} />
        </SearchCreateBookProvider>
      </QueryClientProvider>
    </StoreProvider>
  </React.StrictMode>,
);
