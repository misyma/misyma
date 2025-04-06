import {
  type CreateBookRequestBody,
  type CreateAuthorRequestBody,
  type FindAuthorsResponseBody,
} from '@common/contracts';

import { useToast } from '../../../common/components/toast/use-toast';
import { stripFalsyObjectKeys } from '../../../common/utils/stripFalsyObjectKeys';
import { useCreateAdminBookMutation } from '../../api/admin/mutations/createAdminBookMutation/createAdminBookMutation';
import { BookApiError } from '../../errors/bookApiError';

interface CreatePayload {
  authorPayload?: Partial<CreateAuthorRequestBody> & {
    authorIds?: string[];
  };
  bookPayload: Omit<CreateBookRequestBody, 'authorIds'>;
}

interface UseAdminCreateBookResult {
  create: (payload: CreatePayload) => Promise<void>;
  isProcessing: boolean;
}

interface UseAdminCreateBookProps {
  onAuthorCreationError?: () => Promise<FindAuthorsResponseBody | undefined>;
  onOperationError: (message: string) => void;
}

export const useAdminCreateBook = ({ onOperationError }: UseAdminCreateBookProps): UseAdminCreateBookResult => {
  const { toast } = useToast();

  const { mutateAsync: createBookMutation, isPending: isCreateBookPending } = useCreateAdminBookMutation({});

  const create = async ({ authorPayload, bookPayload }: CreatePayload) => {
    try {
      const authorIds = authorPayload?.authorIds ?? [];

      if (bookPayload) {
        const bookPayloadNoNil = stripFalsyObjectKeys(bookPayload);

        await createBookMutation({
          ...bookPayloadNoNil,
          authorIds,
          errorHandling: {
            title: 'Nie udało się stworzyć książki.',
            description: '',
          },
        });
      }

      toast({
        title: 'Książka została stworzona.',
        description: `Książka ${bookPayload?.title} została stworzona 😄`,
        variant: 'success',
      });
    } catch (error) {
      if (error instanceof BookApiError) {
        onOperationError(error.context.message);
        return;
      }

      onOperationError('Coś poszło nie tak. Spróbuj ponownie.');
    }
  };

  return {
    create,
    isProcessing: isCreateBookPending,
  };
};
