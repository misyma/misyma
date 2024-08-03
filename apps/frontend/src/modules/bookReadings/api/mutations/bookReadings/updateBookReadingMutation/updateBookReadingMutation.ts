import { UseMutationOptions } from '@tanstack/react-query';
import {
  BookReading,
  CreateBookReadingResponseBody,
  UpdateBookReadingRequestBody,
  UpdateBookReadingPathParams,
} from '@common/contracts';
import { userStateSelectors } from '../../../../../core/store/states/userState/userStateSlice';
import { useSelector } from 'react-redux';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { BookApiError } from '../../../../../book/errors/bookApiError';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';

type UpdateBookReadingMutationPayload = UpdateBookReadingRequestBody & UpdateBookReadingPathParams;

export const useUpdateBookReadingMutation = (
  options?: UseMutationOptions<BookReading, BookApiError, UpdateBookReadingMutationPayload, unknown>,
) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const updateBookReading = async (payload: UpdateBookReadingMutationPayload) => {
    const { userBookId, readingId, ...body } = payload;

    const response = await HttpService.patch<CreateBookReadingResponseBody>({
      url: `/user-books/${userBookId}/readings/${readingId}`,
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
    mutationFn: updateBookReading,
    ...options,
  });
};
