import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ApiError } from '../../../common/errors/apiError';
import { useStoreSelector } from '../../store/hooks/useStoreSelector';
import { userStateActions, userStateSelectors } from '../../store/states/userState/userStateSlice';
import { UserApiError } from '../../../api/user/errors/userApiError';
import { RefreshUserTokensResponseBody } from '../../../../../../common/contracts/dist/src/schemas/user/refreshUserTokens';
import { useStoreDispatch } from '../../store/hooks/useStoreDispatch';

interface ProviderProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProviderProps) => {
  const { refreshToken } = useStoreSelector(userStateSelectors.selectCurrentUserTokens);

  const storeDispatch = useStoreDispatch();

  const [refreshingToken, setRefreshingToken] = useState<boolean>(false);

  const refreshTokens = async (): Promise<RefreshUserTokensResponseBody | void> => {
    if (refreshingToken) {
      return;
    }

    const refreshUserTokensResponse = await fetch('http://localhost:5000/api/users/token', {
      body: JSON.stringify({
        refreshToken,
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (refreshUserTokensResponse.status !== 200) {
      const responseBody = await refreshUserTokensResponse.json();

      throw new UserApiError({
        message: 'Failed to refresh user tokens.',
        apiResponseError: responseBody,
        statusCode: refreshUserTokensResponse.status,
      });
    }

    return refreshUserTokensResponse.json();
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && (error.context.statusCode === 401 || error.context.statusCode === 400)) {
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
            }
          } catch (error) {
            storeDispatch(userStateActions.removeUserState());
          } finally {
            setRefreshingToken(false);
          }
        }
      },
    }),
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
