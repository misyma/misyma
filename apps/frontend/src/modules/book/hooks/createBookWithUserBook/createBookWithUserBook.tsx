import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import {
  type CreateBookRequestBody,
  type CreateAuthorRequestBody,
  type CreateUserBookResponseBody,
  type FindAuthorsResponseBody,
  UserBook,
} from '@common/contracts';

import { useToast } from '../../../common/components/toast/use-toast';
import { useCreateBookMutation } from '../../api/user/mutations/createBookMutation/createBookMutation';
import {
  type CreateUserBookMutationPayload,
  useCreateUserBookMutation,
} from '../../api/user/mutations/createUserBookMutation/createUserBookMutation';
import { useUploadBookImageMutation } from '../../api/user/mutations/uploadBookImageMutation/uploadBookImageMutation';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys';
import { BookNavigationFromEnum, type BookNavigationFrom } from '../../constants';
import { BookApiError } from '../../errors/bookApiError';

export interface CreatePayload {
  authorPayload?: Partial<CreateAuthorRequestBody> & {
    authorIds: string[];
  };
  bookPayload?: Omit<CreateBookRequestBody, 'authorIds'>;
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
  navigateTo: BookNavigationFrom;
}

export const useCreateBookWithUserBook = ({
  onOperationError,
  navigateTo,
}: UseCreateBookWithUserBookProps): UseCreateBookWithUserBookResult => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const { mutateAsync: createBookMutation, isPending: isCreateBookPending } = useCreateBookMutation({});

  const { mutateAsync: createUserBookMutation, isPending: isCreateUserBookPending } = useCreateUserBookMutation({});

  const { mutateAsync: uploadBookImageMutation, isPending: isUploadImagePending } = useUploadBookImageMutation({});

  const navigate = useNavigate();

  const clearCache = async (userBookPayload: CreatePayload['userBookPayload'], userBook: UserBook) => {
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
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          queryKey.includes('infinite-query') && queryKey.includes(BookApiQueryKeys.findUserBooksBy),
      }),
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey.includes(BookApiQueryKeys.findBooks),
      }),
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          queryKey.includes(BookApiQueryKeys.findUserBooksBy) && queryKey.includes(userBook.book.isbn),
      }),
    ]);
  };

  const create = async ({ authorPayload, bookPayload, userBookPayload, image, bookTitle }: CreatePayload) => {
    if (!bookPayload && !userBookPayload.bookId) {
      throw new Error(`BookId prop is required if book is not being created.`);
    }

    try {
      const authorIds = authorPayload?.authorIds ?? [];

      let bookId = userBookPayload.bookId as string;

      if (bookPayload && !bookId) {
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
        } catch {
          return;
        }
      }

      let userBook: CreateUserBookResponseBody;

      try {
        userBook = await createUserBookMutation({
          ...userBookPayload,
          bookId,
          isFavorite: false,
          errorHandling: {
            title: 'Nie udało się stworzyć książki. Spróbuj ponownie.',
          },
        });
      } catch {
        return;
      }

      await clearCache(userBookPayload, userBook);

      if (image) {
        try {
          await uploadBookImageMutation({
            bookId: userBook.id,
            file: image,
            errorHandling: {
              title: 'Nie udało się przesłać obrazka.',
            },
          });
        } catch {
          return;
        }
      }

      toast({
        title: 'Książka została położona na półce 😄',
        description: `Książka ${bookTitle} została położona na półce 😄`,
        variant: 'success',
      });

      if (navigateTo == BookNavigationFromEnum.shelves) {
        return await navigate({
          to: `/shelves/bookshelf/${userBookPayload.bookshelfId}`,
        });
      }
      return await navigate({
        to: `/mybooks/`,
      });
    } catch (error) {
      if (error instanceof BookApiError) {
        return onOperationError(error.context.message);
      }

      onOperationError('Coś poszło nie tak. Spróbuj ponownie.');
    }
  };

  return {
    create,
    isProcessing: isCreateBookPending || isCreateUserBookPending || isUploadImagePending,
  };
};
