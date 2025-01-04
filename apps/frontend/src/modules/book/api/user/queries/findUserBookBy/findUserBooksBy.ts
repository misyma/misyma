import { type FindUserBooksQueryParams, type FindUserBooksResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { BookApiError } from '../../../../errors/bookApiError';

export interface FindUserBooksByPayload extends FindUserBooksQueryParams {
  accessToken: string;
}

export const findUserBooksBy = async (payload: FindUserBooksByPayload): Promise<FindUserBooksResponseBody> => {
  const mapper = new ErrorCodeMessageMapper({});

  const { accessToken } = payload;

  const queryParams: Record<string, string> = {};

  const keys: Array<keyof FindUserBooksByPayload> = [
    'bookshelfId',
    'isbn',
    'page',
    'title',
    'pageSize',
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

  const response = await HttpService.get<FindUserBooksResponseBody>({
    url: `/user-books`,
    queryParams,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new BookApiError({
      apiResponseError: response.body.context,
      statusCode: response.statusCode,
      message: mapper.map(response.statusCode),
    });
  }

  return response.body;
};
