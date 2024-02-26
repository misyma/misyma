import { FC } from 'react';
import { Provider } from 'react-redux';
import { Outlet } from 'react-router-dom';

import { store } from '../../core/store/store';
import { QueryClientProvider } from '../../core/components/providers/queryClientProvider';

export const RootPage: FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider>
        <Outlet />
      </QueryClientProvider>
    </Provider>
  );
};
