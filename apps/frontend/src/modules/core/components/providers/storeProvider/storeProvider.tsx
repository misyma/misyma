import { type ReactNode } from '@tanstack/react-router';
import { Provider } from 'react-redux';

import { CookieService } from '../../../services/cookieService/cookieService';
import { userStateActions } from '../../../store/states/userState/userStateSlice';
import { store } from '../../../store/store';

interface Props {
  children: ReactNode;
}

export const StoreProvider = ({ children }: Props): JSX.Element => {
  const userData = CookieService.getUserDataCookie();

  if (userData && userData !== '') {
    const user = JSON.parse(userData);

    store.dispatch(userStateActions.setCurrentUser(user));
  }

  const userTokens = CookieService.getUserTokensCookie();

  if (userTokens && userTokens !== '') {
    const tokens = JSON.parse(userTokens);

    store.dispatch(userStateActions.setCurrentUserTokens(tokens));
  }

  return <Provider store={store}>{children}</Provider>;
};
