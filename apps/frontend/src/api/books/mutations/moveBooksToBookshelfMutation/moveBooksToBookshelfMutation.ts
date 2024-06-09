import { UpdateUserBooksRequestBody } from '@common/contracts';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { HttpService } from '../../../../core/services/httpService/httpService.js';
import { BookApiError } from '../../errors/bookApiError.js';
import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper.js';

export interface MoveBooksToBookshelfMutationPayload extends UpdateUserBooksRequestBody {
  accessToken: string;
}

export const useMoveBooksToBookshelfMutation = (
  options: UseMutationOptions<void, BookApiError, MoveBooksToBookshelfMutationPayload>,
) => {
  const mapper = new ErrorCodeMessageMapper({});

  const updateBookshelf = async (payload: MoveBooksToBookshelfMutationPayload) => {
    const { accessToken, ...rest } = payload;

    const response = await HttpService.patch<void>({
      url: '/user-books',
      body: rest as unknown as Record<string, string>,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.success) {
      throw new BookApiError({
        apiResponseError: response.body.context,
        message: mapper.map(response.statusCode),
        statusCode: response.statusCode,
      });
    }

    return response.body;
  };

  return useMutation({
    mutationFn: updateBookshelf,
    ...options,
  });
};
