import { UpdateQuoteResponseBody } from '@common/contracts';
import { UseMutationOptions } from '@tanstack/react-query';
import { UpdateQuotePayload, updateQuote } from './updateQuote';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';

export const useUpdateQuoteMutation = (
  options: UseMutationOptions<UpdateQuoteResponseBody, Error, UpdateQuotePayload>,
) =>
  useErrorHandledMutation({
    mutationFn: updateQuote,
    ...options,
  });
