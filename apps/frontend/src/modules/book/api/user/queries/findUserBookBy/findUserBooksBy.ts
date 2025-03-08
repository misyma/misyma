import { type FindUserBooksQueryParams, type FindUserBooksResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { api } from '../../../../../core/apiClient/apiClient';
import { BookApiError } from '../../../../errors/bookApiError';

export interface FindUserBooksByPayload extends FindUserBooksQueryParams {
  accessToken: string;
}
export const findUserBooksBy = async (payload: FindUserBooksByPayload): Promise<FindUserBooksResponseBody> => {
  const mapper = new ErrorCodeMessageMapper({});

  const queryParams: Record<string, string> = {};
  const keys: Array<keyof FindUserBooksByPayload> = [
    'bookshelfId',
    'isbn',
    'page',
    'title',
    'pageSize',
    'releaseYearBefore',
    'releaseYearAfter',
    'language',
    'status',
    'genreId',
    'isFavorite',
    'authorId',
    'sortField',
    'sortOrder',
  ];

  keys.forEach((key) => {
    if (payload[key] !== '' && payload[key] !== undefined) {
      queryParams[key] = `${payload[key]}`;
    }
  });

  const res = await api('/user-books', {
    params: queryParams,
    validateStatus: () => true,
  });

  if (!(res.status >= 200 && res.status <= 299)) {
    throw new BookApiError({
      apiResponseError: res.data.context,
      statusCode: res.status,
      message: mapper.map(res.status),
    });
  }

  return res.data;
};
