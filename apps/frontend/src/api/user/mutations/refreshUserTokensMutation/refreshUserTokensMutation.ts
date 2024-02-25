import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { RefreshUserTokensResponseBody } from '../../../../../../../common/contracts/dist/src/schemas/user/refreshUserTokens';
import { UserApiError } from '../../errors/userApiError';

export const RefreshUserTokensMutation = (
  options: UseMutationOptions<RefreshUserTokensResponseBody, UserApiError, { refreshToken: string }>,
) => {
  const refreshUserTokens = async (values: { refreshToken: string }) => {
    const refreshUserTokensResponse = await fetch('http://localhost:5000/api/users/token', {
      body: JSON.stringify({
        refreshToken: values.refreshToken,
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

  return useMutation({
    mutationFn: refreshUserTokens,
    ...options,
  });
};
