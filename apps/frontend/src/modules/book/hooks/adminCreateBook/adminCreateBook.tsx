import { useQueryClient } from '@tanstack/react-query';

import {
  type CreateAuthorRequestBody,
  type CreateAuthorResponseBody,
  type FindAuthorsResponseBody,
} from '@common/contracts';

import { useCreateAuthorDraftMutation } from '../../../author/api/user/mutations/createAuthorDraftMutation/createAuthorDraftMutation';
import { useToast } from '../../../common/components/toast/use-toast';
import { stripFalsyObjectKeys } from '../../../common/utils/stripFalsyObjectKeys';
import { useCreateAdminBookMutation } from '../../api/admin/mutations/createAdminBookMutation/createAdminBookMutation';
import { type UseCreateBookMutationPayload } from '../../api/user/mutations/createBookMutation/createBookMutation';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys';
import { BookApiError } from '../../errors/bookApiError';

interface CreatePayload {
  authorPayload?: Partial<CreateAuthorRequestBody> & {
    authorId?: string;
  };
  bookPayload: Omit<UseCreateBookMutationPayload, 'authorIds'>;
}

interface UseAdminCreateBookResult {
  create: (payload: CreatePayload) => Promise<void>;
  isProcessing: boolean;
}

interface UseAdminCreateBookProps {
  onAuthorCreationError?: () => Promise<FindAuthorsResponseBody | undefined>;
  onOperationError: (message: string) => void;
}

export const useAdminCreateBook = ({
  onAuthorCreationError,
  onOperationError,
}: UseAdminCreateBookProps): UseAdminCreateBookResult => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const { mutateAsync: createBookMutation, isPending: isCreateBookPending } = useCreateAdminBookMutation({});

  const { mutateAsync: createAuthorDraft, isPending: isCreateAuthorPending } = useCreateAuthorDraftMutation({});

  const create = async ({ authorPayload, bookPayload }: CreatePayload) => {
    try {
      let authorDraftResponse: CreateAuthorResponseBody | undefined = undefined;

      let authorId = authorPayload?.authorId as string;

      if (authorPayload?.name) {
        try {
          authorDraftResponse = await createAuthorDraft({
            name: authorPayload.name,
            errorHandling: {
              title: 'Nie udało się stworzyć autora.',
            },
          });

          authorId = authorId || (authorDraftResponse?.id as string);
        } catch (error) {
          if (error instanceof Error) {
            if (error.name === 'ResourceAlreadyExistsError') {
              if (onAuthorCreationError) {
                const response = await onAuthorCreationError();

                if (!response?.data[0]) {
                  return;
                }

                authorId = response?.data[0].id as string;
              }

              return;
            }
          }
        }
      }

      if (bookPayload) {
        const bookPayloadNoNil = stripFalsyObjectKeys(bookPayload);

        await createBookMutation({
          ...bookPayloadNoNil,
          authorIds: [authorId],
          errorHandling: {
            title: 'Nie udało się stworzyć książki.',
            description: '',
          },
        });
      }

      await Promise.all([
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => queryKey[0] === BookApiQueryKeys.findBooks,
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => queryKey[0] === BookApiQueryKeys.findBooksAdmin,
        }),
      ]);

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
    isProcessing: isCreateBookPending || isCreateAuthorPending,
  };
};
