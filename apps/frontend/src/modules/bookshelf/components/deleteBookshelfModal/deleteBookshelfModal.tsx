import { FC, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '../../../common/components/dialog/dialog';
import { Button } from '../../../common/components/button/button';
import { HiTrash } from 'react-icons/hi';
import { useDeleteBookshelfMutation } from '../../api/mutations/deleteBookshelfMutation/deleteBookshelfMutation';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { FindBooksByBookshelfIdQueryOptions } from '../../../book/api/user/queries/findBooksByBookshelfId/findBooksByBookshelfIdQueryOptions';
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../common/components/select/select';
import { SelectContent } from '@radix-ui/react-select';
import { cn } from '../../../common/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserBookshelfsQuery } from '../../api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { ShelfApiError } from '../../api/errors/shelfApiError';
import { BookApiError } from '../../../book/errors/bookApiError';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner';
import { BookshelvesApiQueryKeys } from '../../api/queries/bookshelvesApiQueryKeys';
import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery';

interface DialogContentPreConfirmationProps {
  bookshelfId: string;
  bookshelfName: string;
  error?: string;
  onDelete: (vaL: boolean) => Promise<void>;
  onCancel: () => void;
}

const DialogContentPreConfirmation: FC<DialogContentPreConfirmationProps> = ({
  bookshelfId,
  bookshelfName,
  onDelete,
  onCancel,
  error,
}) => {
  const { data: user } = useFindUserQuery();
  const accessToken = useSelector(userStateSelectors.selectAccessToken);
  const { data: bookshelfBooksResponse } = useErrorHandledQuery(
    FindBooksByBookshelfIdQueryOptions({
      bookshelfId,
      userId: user?.id as string,
      accessToken: accessToken as string,
    })
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleInitialConfirmation = async (): Promise<void> => {
    if (
      bookshelfBooksResponse?.data &&
      bookshelfBooksResponse?.data?.length === 0
    ) {
      setIsDeleting(true);
      await onDelete(true);
      setIsDeleting(false);
      return;
    }

    return await onDelete(false);
  };

  return (
    <>
      <DialogHeader className="font-semibold text-center flex justify-center items-center">
        Czy na pewno chcesz usunąć półkę?
      </DialogHeader>
      <div className="w-full flex items-center justify-center">
        <div className="text-center w-[60%]">
          <p className="pt-4">Nie będziesz mieć już dostępu do</p>
          <p className="w-88 truncate">{bookshelfName}</p>
          <p className="pt-4">Ta akcja jest nieodwracalna.</p>
          <p className={error ? 'text-red-500' : 'hidden'}>{error}</p>
        </div>
      </div>
      <DialogFooter className="pt-8 flex sm:justify-center justify-center sm:items-center items-center">
        <Button className="bg-primary w-32 sm:w-40" onClick={onCancel}>
          Anuluj
        </Button>
        <Button
          className="bg-primary w-32 sm:w-40"
          onClick={handleInitialConfirmation}
          disabled={isDeleting}
        >
          Potwierdź
        </Button>
      </DialogFooter>
    </>
  );
};

interface DialogContentPostConfirmationProps {
  bookshelfId: string;
  onDelete: () => Promise<void>;
  onFinished: () => void;
  deletedHandler: () => Promise<void>;
}

const DialogContentPostConfirmation: FC<DialogContentPostConfirmationProps> = ({
  bookshelfId,
  onDelete,
  onFinished,
  deletedHandler,
}) => {
  const [moveBookshelfId, setMoveBookshelfId] = useState('');

  const queryClient = useQueryClient();

  const { data: user } = useFindUserQuery();

  const [error, setError] = useState('');

  const { mutateAsync: deleteBookshelf } = useDeleteBookshelfMutation({});

  const {
    data: bookshelvesData,
    isFetching: isFetchingBookshelves,
    isRefetching: isRetchingBookshelves,
  } = useFindUserBookshelfsQuery({
    userId: user?.id as string,
    pageSize: 50,
  });

  const onMoveAndDelete = async (): Promise<void> => {
    try {
      const fallbackBookshelfId =
        moveBookshelfId.length > 0 ? moveBookshelfId : defaultBookshelf?.id;

      await deleteBookshelf({ bookshelfId, fallbackBookshelfId });

      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === BookshelvesApiQueryKeys.findUserBookshelfs,
      });

      onFinished();

      await deletedHandler();

      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === BookshelvesApiQueryKeys.findUserBookshelfs,
      });
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

  const filteredBookshelves = useMemo(() => {
    return bookshelvesData?.data.filter(
      (val) => val.id !== bookshelfId && val.name !== 'Wypożyczalnia'
    );
  }, [bookshelvesData?.data, bookshelfId]);

  const defaultBookshelf = useMemo(() => {
    return bookshelvesData?.data.find(
      (bookshelf) => bookshelf.name === 'Archiwum'
    );
  }, [bookshelvesData?.data]);

  return (
    <>
      <DialogHeader className="font-semibold text-center flex justify-center items-center">
        Usuń lub przenieś książki
      </DialogHeader>
      <DialogDescription className="flex flex-col gap-4 justify-center items-center">
        {/* Todo: change placeholder to the actual name */}
        <p>Wybierz półkę, na którą zostaną przeniesione książki</p>
        {isFetchingBookshelves && !isRetchingBookshelves ? (
          <LoadingSpinner></LoadingSpinner>
        ) : (
          <Select
            onValueChange={setMoveBookshelfId}
            defaultValue={defaultBookshelf?.id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz półkę" />
              <SelectContent
                className="w-60 sm:w-80"
                style={{
                  position: 'absolute',
                  zIndex: 999,
                  top: 20,
                  left: -10,
                }}
              >
                {filteredBookshelves?.map((bookshelf) => (
                  <SelectItem className="bg-popover" value={bookshelf.id}>
                    {bookshelf.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectTrigger>
          </Select>
        )}
        <p className={error ? 'text-red-500' : 'hidden'}>{error}</p>
      </DialogDescription>
      <DialogFooter className="pt-8 flex sm:justify-center justify-center sm:items-center items-center">
        <Button className="w-32 sm:w-40" onClick={onDelete}>
          Usuń książki
        </Button>
        <Button className="bg-primary w-32 sm:w-40" onClick={onMoveAndDelete}>
          Przenieś na półkę
        </Button>
      </DialogFooter>
    </>
  );
};

interface Props {
  bookshelfId: string;
  bookshelfName: string;
  deletedHandler: () => Promise<void>;
  className?: string;
}

export const DeleteBookshelfModal: FC<Props> = ({
  bookshelfId,
  bookshelfName,
  className,
  deletedHandler,
}: Props) => {
  const queryClient = useQueryClient();

  const [deletionConfirmed, setDeletionConfirmed] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState('');

  const { mutateAsync: deleteBookshelf } = useDeleteBookshelfMutation({});

  const onDelete = async (): Promise<void> => {
    try {
      await deleteBookshelf({ bookshelfId });

      setIsOpen(false);

      await deletedHandler();

      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === BookshelvesApiQueryKeys.findUserBookshelfs,
      });
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
        <Button size="custom" variant="none">
          <HiTrash
            className={cn('text-primary h-8 w-8 cursor-pointer', className)}
          />
        </Button>
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
            <DialogContentPreConfirmation
              error={error}
              bookshelfId={bookshelfId}
              bookshelfName={bookshelfName}
              onDelete={async (val) => {
                if (val === true) {
                  await onDelete();

                  setIsOpen(false);
                } else {
                  setDeletionConfirmed(true);
                }
              }}
              onCancel={() => setIsOpen(false)}
            />
          </>
        ) : (
          <>
            <DialogContentPostConfirmation
              bookshelfId={bookshelfId}
              deletedHandler={deletedHandler}
              onDelete={onDelete}
              onFinished={() => setIsOpen(false)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
