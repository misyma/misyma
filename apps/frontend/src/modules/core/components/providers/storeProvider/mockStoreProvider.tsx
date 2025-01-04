import { type ReactNode } from '@tanstack/react-router';
import { Provider } from 'react-redux';

import { UserRole } from '@common/contracts';

import { userStateActions } from '../../../store/states/userState/userStateSlice';
import { store } from '../../../store/store';

interface Props {
  children: ReactNode;
}

export const MockStoreProvider = ({ children }: Props): JSX.Element => {
  store.dispatch(
    userStateActions.setCurrentUserTokens({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    }),
  );

  store.dispatch(
    userStateActions.setCurrentUser({
      user: {
        email: 'test@misyma.com',
        id: '1',
        name: 'Steve Testowy',
        role: UserRole.user,
      },
    }),
  );

  return <Provider store={store}>{children}</Provider>;
};
