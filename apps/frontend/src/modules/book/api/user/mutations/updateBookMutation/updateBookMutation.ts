import { UseMutationOptions } from '@tanstack/react-query';
import { UpdateBookPayload, updateBook } from './updateBook';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';

export const useUpdateBookMutation = (options: UseMutationOptions<void, Error, UpdateBookPayload>) => {
  return useErrorHandledMutation({
    mutationFn: updateBook,
    ...options,
  });
};
