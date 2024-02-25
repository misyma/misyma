import { FC } from 'react';
import { Provider } from 'react-redux';
import { Outlet } from 'react-router-dom';

import { store } from '../../core/store/store';
import { Providers } from '../../core/components/providers/providers';

export const RootPage: FC = () => {
  return (
    <Provider store={store}>
      <Providers>
        <Outlet />
      </Providers>
    </Provider>
  );
};
