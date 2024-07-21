import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { ReactNode } from '@tanstack/react-router';
import { userStateActions } from '../../../store/states/userState/userStateSlice';
import { UserRole } from '@common/contracts';

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
