import { type QueryKey, useQuery } from '@tanstack/react-query';

import { type FindBookshelfParams, type FindBookshelfResponseBody } from '@common/contracts';

import { api } from '../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../core/apiClient/apiPaths';
import { BookshelvesApiQueryKeys } from '../bookshelvesApiQueryKeys';

const findBookshelfById = async (values: FindBookshelfParams) => {
  const path = ApiPaths.bookshelves.$bookshelfId.path;
  const resolvedPath = path.replace(ApiPaths.bookshelves.$bookshelfId.params.bookshelfId, values.bookshelfId);
  const response = await api.get<FindBookshelfResponseBody>(resolvedPath);

  if (api.isErrorResponse(response)) {
    throw new Error('Error'); // todo: dedicated error
  }

  return response.data;
};

export const useFindBookshelfByIdQuery = (bookshelfId: string) => {
  return useQuery<FindBookshelfResponseBody>({
    queryKey: [BookshelvesApiQueryKeys.findBookshelfById, bookshelfId],
    queryFn: () => findBookshelfById({ bookshelfId }),
    enabled: !!bookshelfId,
  });
};

export const invalidateFindBookshelfByIdQueryPredicate = (queryKey: QueryKey, bookshelfId: string) =>
  queryKey.includes(BookshelvesApiQueryKeys.findBookshelfById) && queryKey.includes(bookshelfId);
