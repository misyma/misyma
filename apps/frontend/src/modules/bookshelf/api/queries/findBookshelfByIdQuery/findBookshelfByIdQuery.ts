import { type QueryKey, useQuery } from '@tanstack/react-query';

import { type FindBookshelfParams, type FindBookshelfResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { api } from '../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../core/apiClient/apiPaths';
import { ShelfApiError } from '../../errors/shelfApiError';
import { BookshelvesApiQueryKeys } from '../bookshelvesApiQueryKeys';

const mapper = new ErrorCodeMessageMapper({});

const findBookshelfById = async (values: FindBookshelfParams) => {
  const path = ApiPaths.bookshelves.$bookshelfId.path;
  const resolvedPath = path.replace('{{bookshelfId}}', values.bookshelfId);
  const response = await api.get<FindBookshelfResponseBody>(resolvedPath);

  api.validateResponse(response, ShelfApiError, mapper);

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
