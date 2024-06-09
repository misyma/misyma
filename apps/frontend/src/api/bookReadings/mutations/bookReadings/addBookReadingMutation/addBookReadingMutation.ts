import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  BookReading,
  CreateBookReadingRequestBody,
  CreateBookReadingPathParams,
  CreateBookReadingResponseBody,
} from '@common/contracts';
import { BookApiError } from '../../../../books/errors/bookApiError';
import { userStateSelectors } from '../../../../../modules/core/store/states/userState/userStateSlice';
import { useSelector } from 'react-redux';
import { HttpService } from '../../../../../modules/core/services/httpService/httpService';

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

  return useMutation({
    mutationFn: addBookReading,
    ...options,
  });
};
