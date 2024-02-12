import { FC } from 'react';
import { Provider } from 'react-redux';
import { Outlet } from 'react-router-dom';

import { store } from '../../core/store/store';

export const RootPage: FC = () => {
  return (
    <Provider store={store}>
      <Outlet />
    </Provider>
  );
};
