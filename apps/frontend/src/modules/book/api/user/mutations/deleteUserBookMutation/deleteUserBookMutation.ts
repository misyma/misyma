import { type UseMutationOptions } from '@tanstack/react-query';

import { type DeleteUserBookPayload, deleteUserBook } from './deleteUserBook';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';

export const useDeleteUserBookMutation = (options: UseMutationOptions<void, Error, DeleteUserBookPayload>) => {
  return useErrorHandledMutation({
    mutationFn: deleteUserBook,
    ...options,
  });
};
