import { UpdateQuoteResponseBody } from '@common/contracts';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { UpdateQuotePayload, updateQuote } from './updateQuote';

export const useUpdateQuoteMutation = (
  options: UseMutationOptions<UpdateQuoteResponseBody, Error, UpdateQuotePayload>,
) =>
  useMutation({
    mutationFn: updateQuote,
    ...options,
  });
