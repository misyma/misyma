import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type CreateUserBookRequestBody, type CreateUserBookResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { type ExtendedTPayload, useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../../core/apiClient/apiPaths';
import { BookApiError } from '../../../../errors/bookApiError';
import { BookApiQueryKeys } from '../../queries/bookApiQueryKeys';

export interface CreateUserBookMutationPayload extends CreateUserBookRequestBody {
  accessToken: string;
}

const mapper = new ErrorCodeMessageMapper({
  400: 'Podano błędne dane.',
  403: 'Brak pozwolenia na stworzenie książki.',
  409: 'Książka z podanym isbn już istnieje na jednej z Twoich półek.',
  500: 'Wewnętrzny błąd serwera.',
});

const createUserBook = async (payload: CreateUserBookRequestBody) => {
  const response = await api.post<CreateUserBookResponseBody>(ApiPaths.userBooks.path, payload);

  api.validateResponse(response, BookApiError, mapper);

  return response.data;
};

export const useCreateUserBookMutation = (
  options: UseMutationOptions<CreateUserBookResponseBody, BookApiError, ExtendedTPayload<CreateUserBookRequestBody>>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: createUserBook,
    ...options,
    onSuccess: async (...args) => {
      if (options.onSuccess) {
        await options.onSuccess(...args);
      }
      // todo: refactor
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId && query.queryKey[1] === args[1].bookshelfId,
        }),
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === BookApiQueryKeys.findUserBooksBy &&
            query.queryKey.includes('infinite-query') &&
            query.queryKey[1] === args[1].bookshelfId,
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => queryKey.includes(BookApiQueryKeys.findBooksAdmin),
        }),
      ]);
    },
  });
};
