import { QueryCache, QueryClient, QueryClientProvider as NativeQueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';

import { type RefreshUserTokensResponseBody } from '@common/contracts';

import { ApiError } from '../../../../common/errors/apiError';
import { UserApiError } from '../../../../user/errors/userApiError';
import { api } from '../../../apiClient/apiClient';
import { ApiPaths } from '../../../apiClient/apiPaths';
import { CookieService } from '../../../services/cookieService/cookieService';
import { useStoreDispatch } from '../../../store/hooks/useStoreDispatch';
import { useStoreSelector } from '../../../store/hooks/useStoreSelector';
import { userStateActions, userStateSelectors } from '../../../store/states/userState/userStateSlice';
import { useToast } from '../../../../common/components/toast/use-toast';

interface ProviderProps {
  children: React.ReactNode;
}

export const QueryClientProvider = ({ children }: ProviderProps) => {
  const storeDispatch = useStoreDispatch();

  const { toast } = useToast();

  const refreshToken = useStoreSelector(userStateSelectors.selectRefreshToken);
  const [refreshingToken, setRefreshingToken] = useState<boolean>(false);

  const refreshTokens = async (): Promise<RefreshUserTokensResponseBody | void> => {
    if (refreshingToken) {
      return;
    }
    const response = await api(ApiPaths.users.token.path, {
      method: 'POST',
      data: {
        refreshToken,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    });

    if (response.status !== 200) {
      throw new UserApiError({
        message: 'Failed to refresh user tokens.',
        apiResponseError: response.data.context,
        statusCode: response.status,
      });
    }

    api.defaults.headers.common.Authorization = `Bearer ${response.data.accessToken}`;

    return response.data;
  };

  const cleanupUser = () => {
    storeDispatch(userStateActions.removeUserState());

    CookieService.removeUserTokensCookie();
    CookieService.removeUserDataCookie();
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retryDelay: 400,
        staleTime: 120 * 1000,
        gcTime: 120 * 1000,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.context.statusCode === 400) {
            return false;
          }
          if (error instanceof ApiError && error.context.statusCode === 401) {
            refreshTokens()
              .then((res) => {
                if (!res) {
                  cleanupUser();
                  return false;
                }
                storeDispatch(userStateActions.setCurrentUserTokens(res));

                CookieService.setUserTokensCookie({
                  accessToken: res.accessToken,
                  refreshToken: res.refreshToken,
                  expiresIn: res.expiresIn,
                });
              })
              .catch(() => {
                cleanupUser();
                setRefreshingToken(false);
              });
          }

          if (error instanceof ApiError && error.context.statusCode >= 500) {
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

              CookieService.setUserTokensCookie({
                accessToken: res.accessToken,
                refreshToken: res.refreshToken,
                expiresIn: res.expiresIn,
              });
            }
          } catch {
            cleanupUser();
          } finally {
            setRefreshingToken(false);
          }
        } else {
          const defaultDescription = "Wystąpił błąd, spróbuj ponownie.";
          const descriptionMap: Record<number, string> = {
            500: "Wewnętrzny błąd serwera",
          };

          let description = "";

          if (error instanceof ApiError) {
            description = descriptionMap[error.context.statusCode] ?? defaultDescription;
          }

          toast({
            variant: "destructive",
            title: "Coś poszło nie tak...",
            description
          })
        }

      },
    }),
  });

  return <NativeQueryClientProvider client={queryClient}>{children}</NativeQueryClientProvider>;
};
