import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  BookReading,
  CreateBookReadingRequestBody,
  CreateBookReadingPathParams,
  CreateBookReadingResponseBody,
} from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { BookApiError } from '../../errors/bookApiError';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';

type AddBookReadingMutationPayload = CreateBookReadingRequestBody &
  CreateBookReadingPathParams & {
    userId: string;
  };

export const useAddBookReadingMutation = (
  options?: UseMutationOptions<BookReading, BookApiError, AddBookReadingMutationPayload, unknown>,
) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const addBookReading = async (payload: AddBookReadingMutationPayload) => {
    const { userId, userBookId, ...body } = payload;

    const response = await HttpService.post<CreateBookReadingResponseBody>({
      url: `/users/${userId}/books/${userBookId}/readings`,
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

    return response.body.bookReading;
  };

  return useMutation({
    mutationFn: addBookReading,
    ...options,
  });
};
