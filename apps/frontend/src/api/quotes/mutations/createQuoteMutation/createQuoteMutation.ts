import { CreateQuoteResponseBody } from '@common/contracts';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { CreateQuoteMutationPayload, createQuote } from './createQuote';

export const useCreateQuoteMutation = (
  options: UseMutationOptions<CreateQuoteResponseBody, Error, CreateQuoteMutationPayload>,
) =>
  useMutation({
    mutationFn: createQuote,
    ...options,
  });
