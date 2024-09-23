import { render, RenderOptions } from '@testing-library/react';
import { StoreProvider } from '../modules/core/components/providers/storeProvider/storeProvider';
import { QueryClientProvider } from '../modules/core/components/providers/queryClientProvider/queryClientProvider';
import { SearchCreateBookProvider } from '../modules/bookshelf/context/searchCreateBookContext/searchCreateBookContext';
import { BreadcrumbKeysProvider } from '../modules/common/contexts/breadcrumbKeysContext';
import { ReactNode, useEffect } from 'react';
import { useStoreDispatch } from '../modules/core/store/hooks/useStoreDispatch';
import { userStateActions } from '../modules/core/store/states/userState/userStateSlice';

const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return (
    <StoreProvider>
      <SuplementedDummyData>
        <QueryClientProvider>
          <SearchCreateBookProvider>
            <BreadcrumbKeysProvider>{children}</BreadcrumbKeysProvider>
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
      })
    );
  }, [storeDispatch]);

  return <>{children}</>;
};

const customRender = (ui: ReactNode, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender };
