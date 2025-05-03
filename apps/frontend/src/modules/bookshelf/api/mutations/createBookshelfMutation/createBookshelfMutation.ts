import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { type CreateBookshelfRequestBody, type CreateBookshelfResponseBody } from '@common/contracts';

import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../core/apiClient/apiPaths';
import { ShelfApiError } from '../../errors/shelfApiError';
import { invalidateBookshelvesQueriesPredicate } from '../../queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { z } from 'zod';
import { bookshelfNameSchema } from '../../schemas/bookshelfSchemas';

export const createBookshelfSchema = z.object({
  name: bookshelfNameSchema,
});

export type CreateBookshelfSchema = z.infer<typeof createBookshelfSchema>;

const mapper = new ErrorCodeMessageMapper({
  409: 'Posiadasz już półkę o tej nazwie.',
});

const createBookshelf = async (payload: CreateBookshelfSchema) => {
  payload satisfies CreateBookshelfRequestBody;

  const response = await api.post<CreateBookshelfResponseBody>(ApiPaths.bookshelves.path, payload, {
    errorCtor: ShelfApiError,
    mapper,
  });

  return response.data;
};

export const useCreateBookshelfMutation = (
  options: UseMutationOptions<CreateBookshelfResponseBody, ShelfApiError, CreateBookshelfSchema>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: createBookshelf,
    ...options,
    onSuccess: async (data, variables, context) => {
      if (options.onSuccess) {
        await options.onSuccess(data, variables, context);
      }

      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) => invalidateBookshelvesQueriesPredicate(queryKey),
      });
    },
  });
};
