import { type UseMutationOptions, useMutation } from '@tanstack/react-query';

import { type CreateQuoteResponseBody } from '@common/contracts';

import { type CreateQuoteMutationPayload, createQuote } from './createQuote';

export const useCreateQuoteMutation = (
  options: UseMutationOptions<CreateQuoteResponseBody, Error, CreateQuoteMutationPayload>,
) =>
  useMutation({
    mutationFn: createQuote,
    ...options,
  });
