import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { ReactNode } from '@tanstack/react-router';
import { userStateActions } from '../../../store/states/userState/userStateSlice';
import Cookie from 'js-cookie';

interface Props {
  children: ReactNode;
}

const userDataCookieName = 'misyma-user-data-cookie';

const userTokensCookieName = 'misyma-user-tokens-cookie';

// eslint-disable-next-line no-empty-pattern
export const StoreProvider = ({ children }: Props): JSX.Element => {
  const userData = Cookie.get(userDataCookieName);

  if (userData && userData !== '') {
    const user = JSON.parse(userData);

    store.dispatch(userStateActions.setCurrentUser(user));
  }

  const userTokens = Cookie.get(userTokensCookieName);

  if (userTokens && userTokens !== '') {
    const tokens = JSON.parse(userTokens);

    store.dispatch(userStateActions.setCurrentUserTokens(tokens));
  }

  return <Provider store={store}>{children}</Provider>;
};
