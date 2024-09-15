import { UseMutationOptions } from '@tanstack/react-query';
import { DeleteUserBookPayload, deleteUserBook } from './deleteUserBook';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';

export const useDeleteUserBookMutation = (options: UseMutationOptions<void, Error, DeleteUserBookPayload>) => {
  return useErrorHandledMutation({
    mutationFn: deleteUserBook,
    ...options,
  });
};
