import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { BookReading, CreateBookReadingRequestBody, CreateBookReadingPathParams, CreateBookReadingResponseBody } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { BookApiError } from '../../errors/bookApiError';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';

type AddBookReadingMutationPayload = CreateBookReadingRequestBody & CreateBookReadingPathParams;

export const useAddBookReadingMutation = (
  options?: UseMutationOptions<BookReading, BookApiError, AddBookReadingMutationPayload, unknown>,
) => {
  const { accessToken } = useSelector(userStateSelectors.selectCurrentUserTokens) as { accessToken: string; refreshToken: string };

  const addBookReading = async (payload: AddBookReadingMutationPayload) => {
    const response = await HttpService.post<CreateBookReadingResponseBody>({
      url: `/books/${payload.bookId}/book-readings`,
      body: payload as unknown as Record<string, unknown>,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });

    if (response.success === false) {
      throw new BookApiError({
        apiResponseError: response.body.context,
        message: response.body.message,
        statusCode: response.statusCode,
      });
    }

    return response.body.bookReading;
  };

  return useMutation({
    mutationFn: addBookReading,
    ...options,
  });
};
