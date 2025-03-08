import { useQuery } from '@tanstack/react-query';

import { type FindUserResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { api } from '../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../core/apiClient/apiPaths';
import { UserApiError } from '../../../errors/userApiError';
import { UserApiQueryKeys } from '../userApiQueryKeys';

export const findUser = async () => {
  const mapper = new ErrorCodeMessageMapper({});

  const findUserResponse = await api.get<FindUserResponseBody>(ApiPaths.users.me.path);

  if (api.isErrorResponse(findUserResponse)) {
    throw new UserApiError({
      message: mapper.map(findUserResponse.status),
      apiResponseError: findUserResponse.data.context,
      statusCode: findUserResponse.status,
    });
  }

  return findUserResponse.data;
};

export const useFindUserQuery = () => {
  return useQuery<FindUserResponseBody>({
    queryKey: [UserApiQueryKeys.findUser],
    queryFn: findUser,
  });
};
