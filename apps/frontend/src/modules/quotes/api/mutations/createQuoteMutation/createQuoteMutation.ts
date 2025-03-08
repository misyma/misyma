import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { type CreateQuoteRequestBody, type CreateQuoteResponseBody } from '@common/contracts';

import { api } from '../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../core/apiClient/apiPaths';
import { invalidateInfiniteQuotesPredicate } from '../../queries/getQuotes/getQuotes';

export interface CreateQuoteMutationPayload extends CreateQuoteRequestBody {
  userId: string;
}
export const createQuoteSchema = z
  .object({
    page: z
      .string({
        required_error: 'Strona jest wymagana.',
      })
      .max(16, {
        message: 'Strona może mieć maksylamnie 16 znaków.',
      })
      .or(z.literal('')),
    content: z
      .string({
        required_error: 'Cytat jest wymagany.',
      })
      .min(1, 'Cytat musi mieć minimum 1 znak.')
      .max(1000, 'Cytat może mieć maksymalnie 1000 znaków.'),
  })
  .superRefine((value, ctx) => {
    if (!value.page) {
      return;
    }

    const pageRegex = /^\d+(-\d+)?$/;

    if (!pageRegex.test(value.page)) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_string,
        message: 'Zły format. Pożądany format liczba albo liczba-liczba.',
        validation: 'regex',
        path: ['page'],
      });
    }
  });

export type CreateQuote = z.infer<typeof createQuoteSchema>;

const createQuote = async (payload: CreateQuoteMutationPayload): Promise<CreateQuoteResponseBody> => {
  const response = await api.post<CreateQuoteResponseBody>(ApiPaths.quotes.path, payload);

  if (api.isErrorResponse(response)) {
    throw new Error(response.data.message); // todo: dedicated api error
  }

  return response.data;
};

export const useCreateQuoteMutation = (
  options: UseMutationOptions<CreateQuoteResponseBody, Error, CreateQuoteMutationPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuote,
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => invalidateInfiniteQuotesPredicate(queryKey),
      });
    },
  });
};
