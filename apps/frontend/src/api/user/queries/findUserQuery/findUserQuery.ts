import { useQuery } from '@tanstack/react-query';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { UserApiError } from '../../errors/userApiError';
import { useSelector } from 'react-redux';
import { FindUserResponseBody } from '../../../../../../../common/contracts/dist/src/schemas/user/findUser';

interface FindUserPayload {
  accessToken: string;
  refreshToken: string;
}

export const useFindUserQuery = () => {
  const userTokens = useSelector(userStateSelectors.selectCurrentUserTokens) as FindUserPayload;

  const findUser = async (values: FindUserPayload) => {
    const { accessToken } = values;

    const getUserResponse = await fetch('http://localhost:5000/api/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (getUserResponse.status !== 200) {
      const message = mapStatusCodeToErrorMessage(getUserResponse.status);

      const responseBody = await getUserResponse.json();

      throw new UserApiError({
        message,
        apiResponseError: responseBody,
        statusCode: getUserResponse.status,
      });
    }

    const getUserResponseBody = await getUserResponse.json() as FindUserResponseBody;

    const { id, email, name, isEmailVerified } = getUserResponseBody;

    return {
      id,
      email,
      name,
      isEmailVerified
    };
  };

  return useQuery<FindUserResponseBody>({
    queryKey: ['findUser'],
    queryFn: () => findUser(userTokens),
    enabled: !!userTokens.accessToken,
  });
};

const mapStatusCodeToErrorMessage = (statusCode: number) => {
  switch (statusCode) {
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not found';
    case 500:
      return 'Internal server error';
    default:
      return 'Unknown error';
  }
};
