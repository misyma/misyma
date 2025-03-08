import { type QueryKey, queryOptions } from '@tanstack/react-query';

import { type FindUserBookPathParams, type FindUserBookResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper.js';
import { api } from '../../../../../core/apiClient/apiClient.js';
import { BookApiError } from '../../../../errors/bookApiError.js';
import { BookApiQueryKeys } from '../bookApiQueryKeys.js';

const mapper = new ErrorCodeMessageMapper({});

export const findUserBookById = async (payload: FindUserBookPathParams): Promise<FindUserBookResponseBody> => {
  const response = await api.get<FindUserBookResponseBody>(`/user-books/${payload.userBookId}`);

  if (api.isErrorResponse(response)) {
    throw new BookApiError({
      apiResponseError: response.data.context,
      statusCode: response.status,
      message: mapper.map(response.status),
    });
  }

  return response.data;
};

export const FindUserBookByIdQueryOptions = ({ userBookId }: FindUserBookPathParams) =>
  queryOptions({
    queryKey: [BookApiQueryKeys.findUserBookById, userBookId],
    queryFn: () =>
      findUserBookById({
        userBookId,
      }),
    enabled: !!userBookId,
  });

export const invalidateFindUserBookByIdQueryPredicate = (queryKey: QueryKey, userBookId: string) =>
  queryKey.includes(BookApiQueryKeys.findUserBookById) && queryKey.includes(userBookId);
