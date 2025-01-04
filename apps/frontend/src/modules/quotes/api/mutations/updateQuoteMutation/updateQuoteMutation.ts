import { type UseMutationOptions } from '@tanstack/react-query';

import { type UpdateQuoteResponseBody } from '@common/contracts';

import { type UpdateQuotePayload, updateQuote } from './updateQuote';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';

export const useUpdateQuoteMutation = (
  options: UseMutationOptions<UpdateQuoteResponseBody, Error, UpdateQuotePayload>,
) =>
  useErrorHandledMutation({
    mutationFn: updateQuote,
    ...options,
  });
