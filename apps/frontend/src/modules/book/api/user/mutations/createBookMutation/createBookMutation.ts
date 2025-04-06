import { type UseMutationOptions } from '@tanstack/react-query';

import { type CreateBookRequestBody, type CreateBookResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../../core/apiClient/apiPaths';
import { BookApiError } from '../../../../errors/bookApiError';

const mapper = new ErrorCodeMessageMapper({
  400: 'Podano błędne dane.',
  403: 'Brak pozwolenia na stworzenie książki.',
  409: (error) => {
    if ('isbn' in error.context) {
      return 'Książka o podanym numerze isbn już istnieje.';
    }

    return 'Książka już istnieje.';
  },
  500: 'Wewnętrzny błąd serwera.',
});

const createBook = async (payload: CreateBookRequestBody) => {
  const response = await api.post<CreateBookResponseBody>(ApiPaths.books.path, payload, {
    errorCtor: BookApiError,
    mapper,
  });

  return response.data;
};

export const useCreateBookMutation = (
  options: UseMutationOptions<CreateBookResponseBody, BookApiError, CreateBookRequestBody>,
) => {
  return useErrorHandledMutation({
    mutationFn: createBook,
    ...options,
    // todo: add invalidation
  });
};
