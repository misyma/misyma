import { PopoverTrigger } from '@radix-ui/react-popover';
import { useQueryClient } from '@tanstack/react-query';
import { CommandLoading } from 'cmdk';
import { type FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { SortOrder } from '@common/contracts';

import { useFindUserBookshelfsQuery } from '../../../bookshelf/api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { useUpdateBorrowingMutation } from '../../../borrowing/api/mutations/updateBorrowingMutation/updateBorrowingMutation';
import { BorrowingApiQueryKeys } from '../../../borrowing/api/queries/borrowingApiQueryKeys';
import { FindBookBorrowingsQueryOptions } from '../../../borrowing/api/queries/findBookBorrowings/findBookBorrowingsQueryOptions';
import { Button } from '../../../common/components/button/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../common/components/command/command';
import { Popover, PopoverContent } from '../../../common/components/popover/popover';
import { Skeleton } from '../../../common/components/skeleton/skeleton';
import { useToast } from '../../../common/components/toast/use-toast';
import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useUpdateUserBookMutation } from '../../api/user/mutations/updateUserBookMutation/updateUserBookMutation';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys';
import { invalidateBooksByBookshelfIdQuery } from '../../api/user/queries/findBooksByBookshelfId/findBooksByBookshelfIdQueryOptions';
import { FindUserBookByIdQueryOptions } from '../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { invalidateFindUserBooksByQuery } from '../../api/user/queries/findUserBookBy/findUserBooksByQueryOptions';
import { CreateBorrowingModal } from '../createBorrowingModal/createBorrowingModal';

interface Props {
  bookId: string;
  currentBookshelfId: string;
}

export const BookshelfChoiceDropdown: FC<Props> = ({ bookId, currentBookshelfId }) => {
  const queryClient = useQueryClient();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: userData } = useFindUserQuery();

  const { data, isFetching, isFetched, isRefetching } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  );

  const { toast } = useToast();

  const [searchedName, setSearchedName] = useState<string | undefined>(undefined);

  const { data: bookshelfData, isLoading } = useFindUserBookshelfsQuery({
    pageSize: 150,
    name: searchedName,
  });

  const [open, setOpen] = useState(false);

  const [usingBorrowFlow, setUsingBorrowFlow] = useState(false);

  const [selectedBookshelfId, setSelectedBookshelfId] = useState(data?.bookshelfId ?? '');

  const [previousBookshelfId, setPreviousBookshelfId] = useState<string | null>(null);

  const booksBookshelf = useMemo(() => {
    return bookshelfData?.data.find((bookshelf) => data?.bookshelfId === bookshelf.id);
  }, [bookshelfData, data]);

  const { data: bookBorrowing, isFetching: isFetchingBookBorrowing } = useErrorHandledQuery(
    FindBookBorrowingsQueryOptions({
      accessToken: accessToken as string,
      userBookId: bookId,
      page: 1,
      pageSize: 1,
      sortDate: SortOrder.desc,
      isOpen: true,
    }),
  );

  const borrowingBookshelfId = bookshelfData?.data.find((bksh) => bksh.name === 'Wypożyczalnia')?.id;

  const [previousBookshelfName, setPreviousBookshelfName] = useState<string | null>(booksBookshelf?.name ?? null);

  const [currentBookshelf, setCurrentBookshelf] = useState('');

  useEffect(() => {
    setPreviousBookshelfName(previousBookshelfName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booksBookshelf]);

  const { mutateAsync: updateUserBook } = useUpdateUserBookMutation({});

  const { mutateAsync: updateBorrowing } = useUpdateBorrowingMutation({});

  const onBookshelfChange = async (id: string, bookshelfName: string): Promise<void> => {
    if (bookshelfName === 'Wypożyczalnia') {
      return setUsingBorrowFlow(true);
    }

    if (id === currentBookshelfId) {
      return;
    }

    await updateUserBook({
      userBookId: bookId,
      bookshelfId: id,
      accessToken: accessToken as string,
    });

    if (previousBookshelfName === 'Wypożyczalnia') {
      await updateBorrowing({
        accessToken: accessToken as string,
        borrowingId: bookBorrowing?.data?.[0].id as string,
        userBookId: bookId,
        endedAt: new Date().toISOString(),
      });

      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          queryKey[0] === BorrowingApiQueryKeys.findBookBorrowingsQuery && queryKey[1] === bookId,
      });
    }

    toast({
      title: `Zmieniono półkę.`,
      description: `Książka znajduje się teraz na: ${bookshelfName}`,
      variant: 'success',
    });

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [BookApiQueryKeys.findUserBookById, bookId, userData?.id],
      }),
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId && query.queryKey[1] === id,
      }),
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId && query.queryKey[1] === currentBookshelfId,
      }),
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === BookApiQueryKeys.findUserBooksBy && query.queryKey[1] === currentBookshelfId,
      }),
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          invalidateBooksByBookshelfIdQuery(
            {
              bookshelfId: currentBookshelfId,
            },
            queryKey,
          ),
      }),
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          invalidateFindUserBooksByQuery(
            {
              bookshelfId: currentBookshelfId,
            },
            queryKey,
          ),
      }),
      borrowingBookshelfId
        ? queryClient.invalidateQueries({
            predicate: ({ queryKey }) =>
              invalidateFindUserBooksByQuery(
                {
                  bookshelfId: id,
                },
                queryKey,
              ),
          })
        : Promise.resolve(),
    ]);
  };

  useEffect(() => {
    if (!currentBookshelf) {
      setCurrentBookshelf(bookshelfData?.data.find((bookshelf) => bookshelf.id === selectedBookshelfId)?.name ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookshelfData]);

  useEffect(() => {
    setCurrentBookshelf(bookshelfData?.data.find((bookshelf) => bookshelf.id === selectedBookshelfId)?.name ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBookshelfId]);

  useEffect(() => {
    setCurrentBookshelf(bookshelfData?.data.find((bookshelf) => bookshelf.id === currentBookshelfId)?.name ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBookshelfId]);

  if (previousBookshelfName === 'Wypożyczalnia' && isFetchingBookBorrowing) {
    return <Skeleton className="w-60 sm:w-92 h-12"></Skeleton>;
  }

  if (isFetching && !isRefetching) {
    return <Skeleton className="w-60 sm:w-92 h-12"></Skeleton>;
  }

  return (
    <>
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            size="custom"
            variant="outline"
            className="border-none text-lg w-60"
            style={{
              justifyContent: 'end',
              padding: 0,
              height: 'auto',
            }}
          >
            <p className="truncate">{currentBookshelf}</p>
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder=""
              onValueChange={setSearchedName}
            />
            <CommandList>
              {
                <>
                  {isFetched && bookshelfData?.data.length === 0 && (
                    <CommandEmpty>Nie znaleziono półki...</CommandEmpty>
                  )}
                  {isLoading && <CommandLoading>Wyszukuję półki</CommandLoading>}
                  <CommandGroup>
                    {bookshelfData?.data.map((bookshelf) => (
                      <CommandItem
                        key={`bookshelf-${bookshelf.id}`}
                        value={bookshelf.id}
                        onSelect={async (value) => {
                          setPreviousBookshelfId(selectedBookshelfId);

                          await onBookshelfChange(
                            value,
                            bookshelfData?.data.find((bookshelf) => bookshelf.id === value)?.name ?? '',
                          );

                          setSelectedBookshelfId(value);

                          setPreviousBookshelfName(booksBookshelf?.name ?? '');
                          setPreviousBookshelfId(booksBookshelf?.id ?? '');

                          setCurrentBookshelf(bookshelf.name);

                          setOpen(false);
                        }}
                      >
                        {bookshelf.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              }
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {usingBorrowFlow && (
        <CreateBorrowingModal
          currentBookshelfId={currentBookshelfId}
          bookId={bookId}
          onMutated={async () => {
            setUsingBorrowFlow(false);

            const borrowingBookshelf = bookshelfData?.data.find((data) => data.name === 'Wypożyczalnia');

            await Promise.all([
              queryClient.invalidateQueries({
                predicate: ({ queryKey }) =>
                  queryKey[0] === BorrowingApiQueryKeys.findBookBorrowingsQuery && queryKey[1] === bookId,
              }),
              queryClient.invalidateQueries({
                queryKey: [BookApiQueryKeys.findUserBookById, bookId, userData?.id],
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
          onClosed={() => {
            setUsingBorrowFlow(false);

            setSelectedBookshelfId(previousBookshelfId as string);
          }}
          open={usingBorrowFlow}
        />
      )}
    </>
  );
};
