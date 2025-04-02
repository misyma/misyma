import { PopoverTrigger } from '@radix-ui/react-popover';
import { useQueryClient } from '@tanstack/react-query';
import { CommandLoading } from 'cmdk';
import { type FC, useEffect, useMemo, useState } from 'react';

import { useFindUserBookshelfsQuery } from '../../../../bookshelf/api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { BorrowingApiQueryKeys } from '../../../../borrowing/api/queries/borrowingApiQueryKeys';
import { Button } from '../../../../common/components/button/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../../common/components/command/command';
import { Popover, PopoverContent } from '../../../../common/components/popover/popover';
import { Skeleton } from '../../../../common/components/skeleton/skeleton';
import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { BookApiQueryKeys } from '../../../api/user/queries/bookApiQueryKeys';
import { FindUserBookByIdQueryOptions } from '../../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { invalidateFindUserBooksByQuery } from '../../../api/user/queries/findUserBookBy/findUserBooksByQueryOptions';
import { useUpdateUserBook } from '../../../hooks/updateUserBook/updateUserBook';
import { CreateBorrowingModal } from '../../organisms/createBorrowingModal/createBorrowingModal';

interface WrappedCreateBorrowingModalProps {
  open: boolean;
  bookId: string;
  currentBookshelfId: string;
  selectedBookshelfId: string;
  searchedName?: string;
  onClosed: () => void;
  onDone: () => void;
}
const WrappedCreateBorrowingModal: FC<WrappedCreateBorrowingModalProps> = ({
  bookId,
  currentBookshelfId,
  searchedName,
  open,
  onClosed,
  onDone,
  selectedBookshelfId,
}) => {
  const queryClient = useQueryClient();

  const { data: bookshelfData } = useFindUserBookshelfsQuery({
    pageSize: 150,
    name: searchedName,
  });

  return (
    <CreateBorrowingModal
      currentBookshelfId={currentBookshelfId}
      bookId={bookId}
      onMutated={async () => {
        onDone();

        const borrowingBookshelf = bookshelfData?.data.find((data) => data.name === 'Wypożyczalnia');

        await Promise.all([
          queryClient.invalidateQueries({
            predicate: ({ queryKey }) =>
              queryKey[0] === BorrowingApiQueryKeys.findBookBorrowingsQuery && queryKey[1] === bookId,
          }),
          queryClient.invalidateQueries({
            queryKey: [BookApiQueryKeys.findUserBookById, bookId],
          }),
          queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId &&
              query.queryKey[1] === selectedBookshelfId,
          }),
          queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey[0] === BookApiQueryKeys.findUserBooksBy && query.queryKey[1] === currentBookshelfId,
          }),
          borrowingBookshelf
            ? queryClient.invalidateQueries({
                predicate: ({ queryKey }) =>
                  invalidateFindUserBooksByQuery(
                    {
                      bookshelfId: borrowingBookshelf.id,
                    },
                    queryKey,
                  ),
              })
            : Promise.resolve(),
        ]);
      }}
      onClosed={onClosed}
      open={open}
    />
  );
};

interface BookshelfChoiceDropdownTriggerProps {
  searchedName?: string;
  selectedBookshelfId?: string;
  bookId: string;
  override: string;
}

const BookshelfChoiceDropdownTrigger: FC<BookshelfChoiceDropdownTriggerProps> = ({
  bookId,
  searchedName,
  selectedBookshelfId,
  override,
}) => {
  const [currentBookshelf, setCurrentBookshelf] = useState('');

  const { data } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  );

  const { data: bookshelfData } = useFindUserBookshelfsQuery({
    pageSize: 150,
    name: searchedName,
  });

  useEffect(() => {
    if (!currentBookshelf) {
      setCurrentBookshelf(bookshelfData?.data.find((bookshelf) => bookshelf.id === selectedBookshelfId)?.name ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookshelfData, selectedBookshelfId]);

  useEffect(() => {
    setCurrentBookshelf(bookshelfData?.data.find((bookshelf) => bookshelf.id === selectedBookshelfId)?.name ?? '');
  }, [bookshelfData, selectedBookshelfId]);

  useEffect(() => {
    if (!currentBookshelf) {
      setCurrentBookshelf(bookshelfData?.data.find((b) => b.id === data?.bookshelfId)?.name ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookshelfData, data]);

  return (
    <div className="bg-muted/50 rounded-lg border border-border/50">
      <Button
        size="custom"
        variant="outline"
        className="!bg:inherit border-none text-lg w-60 !hover:bg-inherit"
        style={{
          justifyContent: 'end',
          padding: 0,
          height: 'auto',
        }}
      >
        <p className="p-2 runcate">{override !== '' ? override : currentBookshelf}</p>
      </Button>
    </div>
  );
};

interface BookshelfItemListProps {
  name?: string;
  bookId: string;
  onSelectBookshelf: (value: string, name: string) => Promise<void>;
}

const BookshelfItemList: FC<BookshelfItemListProps> = ({ name, bookId, onSelectBookshelf }) => {
  const { isLoading: isLoadingBook } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  );

  const { data: bookshelfData, isLoading } = useFindUserBookshelfsQuery({
    pageSize: 150,
    name,
  });

  return (
    <CommandList>
      {
        <>
          {isLoadingBook && bookshelfData?.data.length === 0 && <CommandEmpty>Nie znaleziono półki...</CommandEmpty>}
          {isLoading && <CommandLoading>Wyszukuję półki</CommandLoading>}
          <CommandGroup>
            {bookshelfData?.data.map((bookshelf) => (
              <CommandItem
                key={`bookshelf-${bookshelf.id}`}
                value={bookshelf.id}
                onSelect={async (value) => await onSelectBookshelf(value, bookshelf.name)}
              >
                {bookshelf.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </>
      }
    </CommandList>
  );
};

interface Props {
  bookId: string;
  currentBookshelfId: string;
}
export const BookshelfChoiceDropdown: FC<Props> = ({ bookId, currentBookshelfId }) => {
  const { data, isLoading: isLoadingBook } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  );

  const { updateBookBookshelf, isLoadingBorrowing } = useUpdateUserBook(bookId);

  const [searchedName, setSearchedName] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [usingBorrowFlow, setUsingBorrowFlow] = useState(false);
  const [selectedBookshelfId, setSelectedBookshelfId] = useState(data?.bookshelfId ?? '');
  const [previousBookshelfId, setPreviousBookshelfId] = useState<string | null>(null);

  const { data: bookshelfData } = useFindUserBookshelfsQuery({
    pageSize: 150,
    name: searchedName,
  });

  const booksBookshelf = useMemo(() => {
    return bookshelfData?.data.find((bookshelf) => data?.bookshelfId === bookshelf.id);
  }, [bookshelfData, data]);

  const borrowingBookshelfId = bookshelfData?.data.find((bksh) => bksh.name === 'Wypożyczalnia')?.id;

  const [previousBookshelfName, setPreviousBookshelfName] = useState<string | null>(booksBookshelf?.name ?? null);

  const [currentBookshelf, setCurrentBookshelf] = useState('');

  useEffect(() => {
    setPreviousBookshelfName(previousBookshelfName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booksBookshelf]);

  const onBookshelfChange = async (id: string, bookshelfName: string): Promise<void> => {
    if (bookshelfName === 'Wypożyczalnia') {
      return setUsingBorrowFlow(true);
    }

    if (id === currentBookshelfId) {
      return;
    }

    await updateBookBookshelf({
      currentBookshelfId,
      borrowingBookshelfId,
      bookshelfId: id,
      previousBookshelfName,
      bookshelfName,
    });
  };

  const onSelectBookshelf = async (value: string, bookshelfName: string) => {
    setPreviousBookshelfId(selectedBookshelfId);

    await onBookshelfChange(value, bookshelfData?.data.find((bookshelf) => bookshelf.id === value)?.name ?? '');

    setSelectedBookshelfId(value);

    setPreviousBookshelfName(booksBookshelf?.name ?? '');
    setPreviousBookshelfId(booksBookshelf?.id ?? '');

    setCurrentBookshelf(bookshelfName);

    setOpen(false);
  };

  if ((previousBookshelfName === 'Wypożyczalnia' && isLoadingBorrowing) || isLoadingBook) {
    return <Skeleton className="w-60 sm:w-92 h-12"></Skeleton>;
  }

  return (
    <>
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger>
          <BookshelfChoiceDropdownTrigger
            override={currentBookshelf}
            bookId={bookId}
            searchedName={searchedName}
            selectedBookshelfId={selectedBookshelfId}
          />
        </PopoverTrigger>
        <PopoverContent>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder=""
              onValueChange={setSearchedName}
            />
            <BookshelfItemList
              name={searchedName}
              bookId={bookId}
              onSelectBookshelf={onSelectBookshelf}
            />
          </Command>
        </PopoverContent>
      </Popover>
      {usingBorrowFlow && (
        <WrappedCreateBorrowingModal
          bookId={bookId}
          currentBookshelfId={currentBookshelfId}
          onClosed={() => {
            setUsingBorrowFlow(false);

            setSelectedBookshelfId(previousBookshelfId as string);

            setCurrentBookshelf(
              bookshelfData?.data.find((i) => i.id === previousBookshelfId)?.name ?? currentBookshelf,
            );
          }}
          onDone={() => setUsingBorrowFlow(false)}
          open={usingBorrowFlow}
          searchedName={searchedName}
          selectedBookshelfId={selectedBookshelfId}
        />
      )}
    </>
  );
};
