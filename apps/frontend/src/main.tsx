import { RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';

import './i18n.ts';
import './index.css';
import { SearchCreateBookProvider } from './modules/bookshelf/context/searchCreateBookContext/searchCreateBookContext.tsx';
import { BreadcrumbKeysProvider } from './modules/common/contexts/breadcrumbKeysContext.tsx';
import { QueryClientProvider } from './modules/core/components/providers/queryClientProvider/queryClientProvider.tsx';
import { StoreProvider } from './modules/core/components/providers/storeProvider/storeProvider.tsx';
import { type AppRouter, router } from './modules/core/router/router.ts';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter;
  }
  interface StaticDataRouteOption {
    routeDisplayableNameParts?: {
      readableName: string;
      href: keyof FileRoutesByPath;
    }[];
  }
}

const rootElement = document.getElementById('root')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <StoreProvider>
        <QueryClientProvider>
          <ReactQueryDevtools />
          <SearchCreateBookProvider>
            <BreadcrumbKeysProvider>
              <RouterProvider router={router} />
            </BreadcrumbKeysProvider>
          </SearchCreateBookProvider>
        </QueryClientProvider>
      </StoreProvider>
    </React.StrictMode>,
  );
}
