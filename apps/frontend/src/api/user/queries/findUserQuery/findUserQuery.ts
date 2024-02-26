import { useQuery } from '@tanstack/react-query';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { UserApiError } from '../../errors/userApiError';
import { useSelector } from 'react-redux';
import { type FindUserResponseBody } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';

interface FindUserPayload {
  accessToken: string;
  refreshToken: string;
}

export const useFindUserQuery = () => {
  const userTokens = useSelector(userStateSelectors.selectCurrentUserTokens) as FindUserPayload;

  const findUser = async (values: FindUserPayload) => {
    const { accessToken } = values;

    const findUserResponse = await HttpService.get<FindUserResponseBody>({
      url: '/users/me',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (findUserResponse.success === false) {
      throw new UserApiError({
        message: mapStatusCodeToErrorMessage(findUserResponse.statusCode),
        apiResponseError: findUserResponse.body.context,
        statusCode: findUserResponse.statusCode,
      });
    }

    return findUserResponse.body;
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
