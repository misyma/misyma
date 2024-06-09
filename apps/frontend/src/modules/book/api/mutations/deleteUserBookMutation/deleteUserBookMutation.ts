import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { DeleteUserBookPayload, deleteUserBook } from './deleteUserBook';

export const useDeleteUserBookMutation = (options: UseMutationOptions<void, Error, DeleteUserBookPayload>) => {
  return useMutation({
    mutationFn: deleteUserBook,
    ...options,
  });
};
