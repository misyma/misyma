import { FC, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '../../../../modules/common/components/ui/dialog';
import { Button } from '../../../../modules/common/components/ui/button';
import { HiTrash } from 'react-icons/hi';
import { useDeleteBookshelfMutation } from '../../../../api/bookshelf/mutations/deleteBookshelfMutation/deleteBookshelfMutation';
import { ShelfApiError } from '../../../../api/bookshelf/errors/shelfApiError';
import { useMoveBooksToBookshelfMutation } from '../../../../api/books/mutations/moveBooksToBookshelfMutation/moveBooksToBookshelfMutation';
import { useFindUserQuery } from '../../../../api/user/queries/findUserQuery/findUserQuery';
import { FindBooksByBookshelfIdQueryOptions } from '../../../../api/books/queries/findBooksByBookshelfId/findBooksByBookshelfIdQueryOptions';
import { BookApiError } from '../../../../api/books/errors/bookApiError';
import { useFindUserBookshelfsQuery } from '../../../../api/bookshelf/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { Select, SelectItem, SelectTrigger, SelectValue } from '../../../../modules/common/components/ui/select';
import { SelectContent } from '@radix-ui/react-select';
import { cn } from '../../../../modules/common/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice';

interface Props {
  bookshelfId: string;
  bookshelfName: string;
  deletedHandler: () => Promise<void>;
  className?: string;
}

export const DeleteBookshelfModal: FC<Props> = ({ bookshelfId, bookshelfName, className, deletedHandler }: Props) => {
  const queryClient = useQueryClient();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const [deletionConfirmed, setDeletionConfirmed] = useState<boolean>(false);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [error, setError] = useState('');

  const [moveBookshelfId, setMoveBookshelfId] = useState('');

  const { data: user } = useFindUserQuery();

  const { mutateAsync: deleteBookshelf } = useDeleteBookshelfMutation({});

  const { mutateAsync: moveBooksToBookshelf } = useMoveBooksToBookshelfMutation({});

  const { data: bookshelfBooksResponse } = useQuery(
    FindBooksByBookshelfIdQueryOptions({
      bookshelfId,
      userId: user?.id as string,
      accessToken: accessToken as string,
    }),
  );

  const {
    data: bookshelvesData,
    // refetch: refetchBookshelves,
    // isFetching,
    // isFetched,
  } = useFindUserBookshelfsQuery(user?.id);

  const onDelete = async (): Promise<void> => {
    try {
      await deleteBookshelf({
        bookshelfId,
      });

      setIsOpen(false);

      await deletedHandler();
    } catch (error) {
      if (error instanceof ShelfApiError) {
        return setError(error.message);
      }

      if (error instanceof Error) {
        return setError(error.message);
      }

      throw error;
    }
  };

  const onMoveAndDelete = async (): Promise<void> => {
    try {
      if (bookshelfBooksResponse?.data && bookshelfBooksResponse?.data?.length > 0) {
        await moveBooksToBookshelf({
          data:
            bookshelfBooksResponse?.data.map((userBook) => ({
              bookshelfId: moveBookshelfId,
              userBookId: userBook.id,
            })) ?? [],
          accessToken: accessToken as string,
        });

        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === 'findBookshelfById' && query.queryKey[1] === moveBookshelfId,
        });
      }

      await onDelete();
    } catch (error) {
      if (error instanceof BookApiError) {
        return setError(error.message);
      }

      if (error instanceof Error) {
        return setError(error.message);
      }

      throw error;
    }
  };

  const handleInitialConfirmation = async (): Promise<void> => {
    if (bookshelfBooksResponse?.data && bookshelfBooksResponse?.data?.length === 0) {
      await onDelete();
    } else {
      setDeletionConfirmed(true);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        setIsOpen(val);

        setDeletionConfirmed(false);

        setError('');
      }}
    >
      <DialogTrigger asChild>
        <HiTrash className={cn('text-primary h-8 w-8 cursor-pointer', className)} />
      </DialogTrigger>
      <DialogContent
        style={{
          borderRadius: '40px',
        }}
        className="max-w-xl py-16"
        omitCloseButton={true}
      >
        {!deletionConfirmed ? (
          <>
            <DialogHeader className="font-semibold text-center flex justify-center items-center">
              Czy na pewno chcesz usunąć półkę?
            </DialogHeader>
            <DialogDescription className="flex flex-col gap-4 justify-center items-center">
              <p>Nie będziesz mieć już dostępu do "{bookshelfName}".</p>
              <p>Ta akcja jest nieodwracalna.</p>
            </DialogDescription>
            <DialogFooter className="pt-8 flex sm:justify-center justify-center sm:items-center items-center">
              <Button
                className="bg-primary w-32 sm:w-40"
                onClick={() => setIsOpen(false)}
              >
                Anuluj
              </Button>
              <Button
                className="bg-primary w-32 sm:w-40"
                onClick={handleInitialConfirmation}
              >
                Potwierdź
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="font-semibold text-center flex justify-center items-center">
              Usuń lub przenieś książki
            </DialogHeader>
            <DialogDescription className="flex flex-col gap-4 justify-center items-center">
              {/* Todo: change placeholder to the actual name */}
              <p>Wybierz półkę, na którą zostaną przeniesione książki</p>
              <Select
                onValueChange={setMoveBookshelfId}
                defaultValue={bookshelvesData?.data.find((bookshelf) => bookshelf.name === 'Archiwum')?.id ?? ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz półkę" />
                  <SelectContent
                    style={{
                      position: 'absolute',
                      zIndex: 999,
                      top: 20,
                      left: -10,
                    }}
                  >
                    {bookshelvesData?.data
                      .filter((val) => val.id !== bookshelfId)
                      .map((bookshelf) => (
                        <SelectItem
                          className="bg-popover"
                          value={bookshelf.id}
                        >
                          {bookshelf.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </SelectTrigger>
              </Select>
              <p className={error ? 'text-red-500' : 'hidden'}>{error}</p>
            </DialogDescription>
            <DialogFooter className="pt-8 flex sm:justify-center justify-center sm:items-center items-center">
              <Button
                className="w-32 sm:w-40"
                onClick={onDelete}
              >
                Usuń książki
              </Button>
              <Button
                className="bg-primary w-32 sm:w-40"
                onClick={onMoveAndDelete}
              >
                Przenieś na półkę
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
