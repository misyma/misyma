import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { UpdateBookPayload, updateBook } from './updateBook';

export const useUpdateBookMutation = (options: UseMutationOptions<void, Error, UpdateBookPayload>) => {
  return useMutation({
    mutationFn: updateBook,
    ...options,
  });
};
