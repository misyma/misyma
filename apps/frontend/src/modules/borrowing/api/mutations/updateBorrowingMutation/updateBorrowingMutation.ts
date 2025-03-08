import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import {
  type CreateBorrowingResponseBody,
  type UpdateBorrowingPathParams,
  type UpdateBorrowingRequestBody,
  type UpdateBorrowingResponseBody,
} from '@common/contracts';

import { BookApiError } from '../../../../book/errors/bookApiError';
import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../core/apiClient/apiClient';
import { BorrowingApiQueryKeys } from '../../queries/borrowingApiQueryKeys';

export interface UseUpdateBorrowingMutationPayload extends UpdateBorrowingRequestBody, UpdateBorrowingPathParams {
  userBookId: string;
}

const mapper = new ErrorCodeMessageMapper({
  400: 'Podano błędne dane.',
  403: 'Brak pozwolenia na zaaktualizowanie wypożyczenia książki.',
  500: 'Wewnętrzny błąd serwera.',
});

const updateBorrowing = async (payload: UseUpdateBorrowingMutationPayload) => {
  const { userBookId, borrowingId, ...rest } = payload;

  const response = await api.patch<UpdateBorrowingResponseBody>(
    `/user-books/${userBookId}/borrowings/${borrowingId}`,
    rest,
  );

  if (api.isErrorResponse(response)) {
    throw new BookApiError({
      apiResponseError: response.data.context,
      message: mapper.map(response.status),
      statusCode: response.status,
    });
  }

  return response.data;
};

export const useUpdateBorrowingMutation = (
  options: UseMutationOptions<CreateBorrowingResponseBody, BookApiError, UseUpdateBorrowingMutationPayload>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: updateBorrowing,
    ...options,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          queryKey[0] === BorrowingApiQueryKeys.findBookBorrowingsQuery && queryKey[1] === args[1].userBookId,
      });
    },
  });
};
