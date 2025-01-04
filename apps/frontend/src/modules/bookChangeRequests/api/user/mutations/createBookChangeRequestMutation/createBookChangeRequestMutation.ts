import { type UseMutationOptions } from '@tanstack/react-query';

import { type CreateBookChangeRequestRequestBody, type CreateBookshelfResponseBody } from '@common/contracts';

import { BookApiError } from '../../../../../book/errors/bookApiError';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { HttpService } from '../../../../../core/services/httpService/httpService';

export interface CreateBookChangeRequestPayload extends CreateBookChangeRequestRequestBody {
  accessToken: string;
}

export const useCreateBookChangeRequestMutation = (
  options: UseMutationOptions<CreateBookshelfResponseBody, BookApiError, CreateBookChangeRequestPayload>,
) => {
  const createBookChangeRequest = async (payload: CreateBookChangeRequestPayload) => {
    const { accessToken, ...rest } = payload;

    const response = await HttpService.post<CreateBookshelfResponseBody>(
      {
        url: `/book-change-requests`,
        body: rest as unknown as Record<string, unknown>,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      {
        filterEmptyStrings: true,
      },
    );

    if (!response.success) {
      throw new BookApiError({
        apiResponseError: response.body.context,
        message: response.body.message,
        statusCode: response.statusCode,
      });
    }

    return response.body;
  };

  return useErrorHandledMutation({
    mutationFn: createBookChangeRequest,
    ...options,
  });
};
