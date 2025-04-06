import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type CreateBookRequestBody, type CreateBookResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../../core/apiClient/apiPaths';
import { BookApiError } from '../../../../errors/bookApiError';
import { BookApiQueryKeys } from '../../../user/queries/bookApiQueryKeys';

const mapper = new ErrorCodeMessageMapper({
  400: 'Podano błędne dane.',
  403: 'Brak pozwolenia na stworzenie książki.',
  409: (error) => {
    console.log(error);
    if ('isbn' in error.context) {
      return 'Książka o podanym numerze isbn już istnieje.';
    }

    return 'Książka już istnieje.';
  },
  500: 'Wewnętrzny błąd serwera.',
});

const createBook = async (payload: CreateBookRequestBody) => {
  const { ...body } = payload;

  const response = await api.post<CreateBookResponseBody>(
    ApiPaths.admin.books.path,
    {
      ...body,
      isApproved: true,
    },
    {
      errorCtor: BookApiError,
      mapper,
    },
  );

  return response.data;
};

export const useCreateAdminBookMutation = (
  options: UseMutationOptions<CreateBookResponseBody, BookApiError, CreateBookRequestBody>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: createBook,
    ...options,
    onSuccess: async (...args) => {
      if (options.onSuccess) {
        await options.onSuccess(...args);
      }

      await Promise.all([
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => queryKey[0] === BookApiQueryKeys.findBooks,
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => queryKey[0] === BookApiQueryKeys.findBooksAdmin,
        }),
      ]);
    },
  });
};
