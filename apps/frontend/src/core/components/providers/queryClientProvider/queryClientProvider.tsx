import { QueryCache, QueryClient, QueryClientProvider as NativeQueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ApiError } from '../../../../common/errors/apiError';
import { useStoreSelector } from '../../../store/hooks/useStoreSelector';
import { userStateActions, userStateSelectors } from '../../../store/states/userState/userStateSlice';
import { UserApiError } from '../../../../api/user/errors/userApiError';
import { type RefreshUserTokensResponseBody } from '@common/contracts';
import { useStoreDispatch } from '../../../store/hooks/useStoreDispatch';
import { HttpService } from '../../../services/httpService/httpService';
import Cookie from 'js-cookie';

interface ProviderProps {
  children: React.ReactNode;
}

const userTokensCookieName = 'misyma-user-tokens-cookie';

const userDataCookieName = 'misyma-user-data-cookie';

export const QueryClientProvider = ({ children }: ProviderProps) => {
  const { refreshToken } = useStoreSelector(userStateSelectors.selectCurrentUserTokens);

  const storeDispatch = useStoreDispatch();

  const [refreshingToken, setRefreshingToken] = useState<boolean>(false);

  const refreshTokens = async (): Promise<RefreshUserTokensResponseBody | void> => {
    if (refreshingToken) {
      return;
    }

    const refreshUserTokensResponse = await HttpService.post<RefreshUserTokensResponseBody>({
      url: '/users/token',
      body: {
        refreshToken,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (refreshUserTokensResponse.success === false) {
      throw new UserApiError({
        message: 'Failed to refresh user tokens.',
        apiResponseError: refreshUserTokensResponse.body.context,
        statusCode: refreshUserTokensResponse.statusCode,
      });
    }

    return refreshUserTokensResponse.body;
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.context.statusCode === 401) {
            return false;
          }

          return failureCount < 3;
        },
      },
    },
    queryCache: new QueryCache({
      onError: async (error) => {
        if (error instanceof ApiError && error.context.statusCode === 401) {
          try {
            setRefreshingToken(true);

            const res = await refreshTokens();

            if (res) {
              storeDispatch(userStateActions.setCurrentUserTokens(res));

              Cookie.set(
                userTokensCookieName,
                JSON.stringify({
                  accessToken: res.accessToken,
                  refreshToken: res.refreshToken,
                }),
                {
                  secure: true,
                  sameSite: 'strict',
                },
              );
            }
          } catch (error) {
            storeDispatch(userStateActions.removeUserState());

            Cookie.remove(userTokensCookieName);

            Cookie.remove(userDataCookieName);
          } finally {
            setRefreshingToken(false);
          }
        }
      },
    }),
  });

  return <NativeQueryClientProvider client={queryClient}>{children}</NativeQueryClientProvider>;
};
