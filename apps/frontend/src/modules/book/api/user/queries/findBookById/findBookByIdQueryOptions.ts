import { type QueryKey, queryOptions } from '@tanstack/react-query';

import { type FindBookPathParams, type FindBookResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { api } from '../../../../../core/apiClient/apiClient';
import { BookApiError } from '../../../../errors/bookApiError';
import { BookApiQueryKeys } from '../bookApiQueryKeys';

const mapper = new ErrorCodeMessageMapper({
  403: `Brak pozwolenia na podejrzenie książki.`,
});

export const findBookById = async (payload: FindBookPathParams): Promise<FindBookResponseBody> => {
  const response = await api.get<FindBookResponseBody>(`/books/${payload.bookId}`, {
    errorCtor: BookApiError,
    mapper,
  });

  return response.data;
};

export const FindBookByIdQueryOptions = (
  payload: FindBookPathParams,
) =>
  queryOptions({
    queryKey: [BookApiQueryKeys.findBookById, payload.bookId],
    queryFn: () => findBookById(payload),
    enabled: !!payload.bookId,
  });

export const invalidateFindBookByIdQueryPredicate = (queryKey: QueryKey, id: string) =>
  queryKey.includes(BookApiQueryKeys.findBookById) && queryKey.includes(id);

export const invalidateAllFindBookByIdQueryPredicate = (queryKey: QueryKey) =>
  queryKey.includes(BookApiQueryKeys.findBookById);
