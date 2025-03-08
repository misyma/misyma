import { useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { z } from 'zod';

import {
  type UpdateQuotePathParams,
  type UpdateQuoteRequestBody,
  type UpdateQuoteResponseBody,
} from '@common/contracts';

import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { api } from '../../../../core/apiClient/apiClient';
import { ApiPaths } from '../../../../core/apiClient/apiPaths';
import { invalidateQuotesQueries } from '../../queries/getQuotes/getQuotes';

export const editQuoteSchema = z
  .object({
    page: z
      .string({
        required_error: 'Strona jest wymagana.',
      })
      .max(16, {
        message: 'Strona może mieć maksymalnie 16 znaków.',
      })
      .optional()
      .or(z.literal('')),
    content: z
      .string({
        required_error: 'Cytat jest wymagany.',
      })
      .min(1, 'Cytat musi mieć minimum 1 znak.')
      .max(1000, 'Cytat może mieć maksymalnie 1000 znaków.')
      .optional(),
    isFavorite: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.page) {
      return;
    }

    const match = value.page.match(/[0-9-]+/g);

    if (match?.[0]?.length !== value.page.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_string,
        message: 'Strona powinna zawierać cyfry lub znak `-`',
        validation: 'regex',
        path: ['page'],
      });
    }
  });

export type EditQuote = z.infer<typeof editQuoteSchema>;

export interface UpdateQuotePayload extends UpdateQuotePathParams, UpdateQuoteRequestBody {}
export const updateQuote = async (payload: UpdateQuotePayload) => {
  const { quoteId, ...body } = payload;

  if (body.content === '') {
    delete body.content;
  }

  const path = ApiPaths.quotes.$quoteId.path;
  const resolvedPath = path.replace(ApiPaths.quotes.$quoteId.params.quoteId, quoteId);
  const response = await api.patch<UpdateQuoteResponseBody>(resolvedPath, body);

  if (api.isErrorResponse(response)) {
    throw new Error(response.data.message); //todo: dedicated errors
  }

  return response.data;
};

export const useUpdateQuoteMutation = (
  options: UseMutationOptions<UpdateQuoteResponseBody, Error, UpdateQuotePayload>,
) => {
  const queryClient = useQueryClient();
  return useErrorHandledMutation({
    mutationFn: updateQuote,
    ...options,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => invalidateQuotesQueries(queryKey, data.userBookId),
      });
    },
  });
};
