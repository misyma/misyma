import { type UseMutationOptions } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import {
  type BookReading,
  type CreateBookReadingRequestBody,
  type CreateBookReadingPathParams,
  type CreateBookReadingResponseBody,
} from '@common/contracts';

import { BookApiError } from '../../../../../book/errors/bookApiError';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { userStateSelectors } from '../../../../../core/store/states/userState/userStateSlice';

type AddBookReadingMutationPayload = CreateBookReadingRequestBody & CreateBookReadingPathParams;

export const useAddBookReadingMutation = (
  options?: UseMutationOptions<BookReading, BookApiError, AddBookReadingMutationPayload, unknown>,
) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const addBookReading = async (payload: AddBookReadingMutationPayload) => {
    const { userBookId, ...body } = payload;

    const response = await HttpService.post<CreateBookReadingResponseBody>({
      url: `/user-books/${userBookId}/readings`,
      body: body as unknown as Record<string, unknown>,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.success === false) {
      throw new BookApiError({
        apiResponseError: response.body.context,
        message: response.body.message,
        statusCode: response.statusCode,
      });
    }

    return response.body;
  };

  return useErrorHandledMutation({
    mutationFn: addBookReading,
    ...options,
  });
};
