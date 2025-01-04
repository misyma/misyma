import { render, type RenderOptions } from '@testing-library/react';
import { type ReactNode, useEffect } from 'react';

import { SearchCreateBookProvider } from '../modules/bookshelf/context/searchCreateBookContext/searchCreateBookContext';
import { ToastProvider } from '../modules/common/components/toast/toast';
import { Toaster } from '../modules/common/components/toast/toaster';
import { BreadcrumbKeysProvider } from '../modules/common/contexts/breadcrumbKeysContext';
import { QueryClientProvider } from '../modules/core/components/providers/queryClientProvider/queryClientProvider';
import { StoreProvider } from '../modules/core/components/providers/storeProvider/storeProvider';
import { useStoreDispatch } from '../modules/core/store/hooks/useStoreDispatch';
import { userStateActions } from '../modules/core/store/states/userState/userStateSlice';

const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return (
    <StoreProvider>
      <SuplementedDummyData>
        <QueryClientProvider>
          <SearchCreateBookProvider>
            <BreadcrumbKeysProvider>
              <ToastProvider>
                {children}
                <Toaster />
              </ToastProvider>
            </BreadcrumbKeysProvider>
          </SearchCreateBookProvider>
        </QueryClientProvider>
      </SuplementedDummyData>
    </StoreProvider>
  );
};

const SuplementedDummyData = ({ children }: { children: ReactNode }) => {
  const storeDispatch = useStoreDispatch();

  useEffect(() => {
    storeDispatch(
      userStateActions.setCurrentUserTokens({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      }),
    );
  }, [storeDispatch]);

  return <>{children}</>;
};

const customRender = (ui: ReactNode, options?: RenderOptions) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender };
