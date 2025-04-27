import { useQuery } from '@tanstack/react-query';

import { type FindUserResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { api } from '../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../core/apiClient/apiPaths';
import { UserApiError } from '../../../errors/userApiError';
import { UserApiQueryKeys } from '../userApiQueryKeys';

const mapper = new ErrorCodeMessageMapper({});

const findUser = async () => {
  const response = await api.get<FindUserResponseBody>(ApiPaths.users.me.path, {
    errorCtor: UserApiError,
    mapper,
  });

  return response.data;
};

export const useFindUserQuery = () => {
  return useQuery<FindUserResponseBody>({
    queryKey: [UserApiQueryKeys.findUser],
    queryFn: findUser,
  });
};
