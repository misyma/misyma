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
  409: 'Książka już istnieje.',
  500: 'Wewnętrzny błąd serwera.',
});

const createBook = async (payload: CreateBookRequestBody) => {
  const { ...body } = payload;

  const response = await api.post<CreateBookResponseBody>(ApiPaths.admin.books.path, {
    ...body,
    isApproved: true,
  });

  if (api.isErrorResponse(response)) {
    throw new BookApiError({
      apiResponseError: response.data.context,
      message: mapper.map(response.status),
      statusCode: response.status,
    });
  }

  return response.data;
};

export const useCreateAdminBookMutation = (
  options: UseMutationOptions<CreateBookResponseBody, BookApiError, CreateBookRequestBody>,
) => {
  return useErrorHandledMutation({
    mutationFn: createBook,
    ...options,
  });
};
