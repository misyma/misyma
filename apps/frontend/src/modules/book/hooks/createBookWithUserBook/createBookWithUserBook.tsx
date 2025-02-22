import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useSelector } from 'react-redux';

import {
  type CreateAuthorRequestBody,
  type CreateUserBookResponseBody,
  type FindAuthorsResponseBody,
} from '@common/contracts';

import { useToast } from '../../../common/components/toast/use-toast';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import {
  useCreateBookMutation,
  type UseCreateBookMutationPayload,
} from '../../api/user/mutations/createBookMutation/createBookMutation';
import {
  type CreateUserBookMutationPayload,
  useCreateUserBookMutation,
} from '../../api/user/mutations/createUserBookMutation/createUserBookMutation';
import { useUploadBookImageMutation } from '../../api/user/mutations/uploadBookImageMutation/uploadBookImageMutation';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys';
import { BookApiError } from '../../errors/bookApiError';

interface CreatePayload {
  authorPayload?: Partial<CreateAuthorRequestBody> & {
    authorIds: string[];
  };
  bookPayload?: Omit<UseCreateBookMutationPayload, 'authorIds'>;
  userBookPayload: Omit<CreateUserBookMutationPayload, 'bookId'> & {
    bookId?: string | undefined;
  };
  image?: File;
  bookTitle: string;
}

interface UseCreateBookWithUserBookResult {
  create: (payload: CreatePayload) => Promise<void>;
  isProcessing: boolean;
}

interface UseCreateBookWithUserBookProps {
  onAuthorCreationError?: () => Promise<FindAuthorsResponseBody | undefined>;
  onOperationError: (message: string) => void;
}

export const useCreateBookWithUserBook = ({
  onOperationError,
}: UseCreateBookWithUserBookProps): UseCreateBookWithUserBookResult => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const { mutateAsync: createBookMutation, isPending: isCreateBookPending } = useCreateBookMutation({});

  const { mutateAsync: createUserBookMutation, isPending: isCreateUserBookPending } = useCreateUserBookMutation({});

  const { mutateAsync: uploadBookImageMutation, isPending: isUploadImagePending } = useUploadBookImageMutation({});

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const navigate = useNavigate();

  const create = async ({ authorPayload, bookPayload, userBookPayload, image, bookTitle }: CreatePayload) => {
    if (!bookPayload && !userBookPayload.bookId) {
      throw new Error(`BookId prop is required if book is not being created.`);
    }

    try {
      const authorIds = authorPayload?.authorIds ?? [];

      let bookId = userBookPayload.bookId as string;

      if (bookPayload) {
        try {
          const bookCreationResponse = await createBookMutation({
            ...bookPayload,
            authorIds,
            errorHandling: {
              title: 'Nie udało się stworzyć książki.',
              description: '',
            },
          });

          bookId = bookCreationResponse.id;
        } catch (error) {
          return;
        }
      }

      let userBook: CreateUserBookResponseBody;

      try {
        userBook = await createUserBookMutation({
          ...userBookPayload,
          bookId,
          isFavorite: false,
          accessToken: accessToken as string,
          errorHandling: {
            title: '',
          },
        });
      } catch (error) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId &&
            query.queryKey[1] === userBookPayload?.bookshelfId,
        }),
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === BookApiQueryKeys.findUserBooksBy &&
            query.queryKey.includes('infinite-query') &&
            query.queryKey[1] === userBookPayload?.bookshelfId,
        }),
      ]);

      if (image) {
        try {
          await uploadBookImageMutation({
            bookId: userBook.id,
            file: image,
            accessToken: accessToken as string,
            errorHandling: {
              title: 'Nie udało się przesłać obrazka.',
            },
          });
        } catch (error) {
          return;
        }
      }

      toast({
        title: 'Książka została położona na półce 😄',
        description: `Książka ${bookTitle} została położona na półce 😄`,
        variant: 'success',
      });

      await navigate({
        to: `/shelves/bookshelf/${userBookPayload.bookshelfId}`,
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
    isProcessing: isCreateBookPending || isCreateUserBookPending || isUploadImagePending,
  };
};
