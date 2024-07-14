import { FC, useEffect, useMemo, useState } from 'react';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '../../../common/components/skeleton/skeleton';
import { useToast } from '../../../common/components/toast/use-toast';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserBookshelfsQuery } from '../../../bookshelf/api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { CreateBorrowingModal } from '../createBorrowingModal/createBorrowingModal';
import { SortingType } from '@common/contracts';
import { FindBookBorrowingsQueryOptions } from '../../../borrowing/api/queries/findBookBorrowings/findBookBorrowingsQueryOptions';
import { useUpdateBorrowingMutation } from '../../../borrowing/api/mutations/updateBorrowingMutation/updateBorrowingMutation';
import { BorrowingApiQueryKeys } from '../../../borrowing/api/queries/borrowingApiQueryKeys';
import { FindUserBookByIdQueryOptions } from '../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { useUpdateUserBookMutation } from '../../api/user/mutations/updateUserBookMutation/updateUserBookMutation';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys';
import { Popover, PopoverContent } from '../../../common/components/popover/popover';
import { PopoverTrigger } from '@radix-ui/react-popover';
import { Button } from '../../../common/components/button/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../common/components/command/command';
import { CommandLoading } from 'cmdk';

interface Props {
  bookId: string;
  currentBookshelfId: string;
}

export const BookshelfChoiceDropdown: FC<Props> = ({ bookId, currentBookshelfId }) => {
  const queryClient = useQueryClient();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: userData } = useFindUserQuery();

  const { data, isFetching, isFetched, isRefetching } = useQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  const { toast } = useToast();

  const [searchedName, setSearchedName] = useState<string | undefined>(undefined);

  const { data: bookshelfData, isLoading } = useFindUserBookshelfsQuery({
    userId: userData?.id as string,
    pageSize: 50,
    name: searchedName,
  });

  const [open, setOpen] = useState(false);

  const [usingBorrowFlow, setUsingBorrowFlow] = useState(false);

  const [selectedBookshelfId, setSelectedBookshelfId] = useState(data?.bookshelfId ?? '');

  const [previousBookshelfId, setPreviousBookshelfId] = useState<string | null>(null);

  const booksBookshelf = useMemo(() => {
    return bookshelfData?.data.find((bookshelf) => data?.bookshelfId === bookshelf.id);
  }, [bookshelfData, data]);

  const { data: bookBorrowing, isFetching: isFetchingBookBorrowing } = useQuery(
    FindBookBorrowingsQueryOptions({
      accessToken: accessToken as string,
      userBookId: bookId,
      page: 1,
      pageSize: 1,
      sortDate: SortingType.desc,
    }),
  );

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

    await updateUserBook({
      userBookId: bookId,
      bookshelfId: id,
      accessToken: accessToken as string,
    });

    if (previousBookshelfName === 'Wypożyczalnia') {
      await updateBorrowing({
        accessToken: accessToken as string,
        borrowingId: bookBorrowing?.data[0].id as string,
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

    queryClient.invalidateQueries({
      queryKey: [BookApiQueryKeys.findUserBookById, bookId, userData?.id],
    });

    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId && query.queryKey[1] === id,
    });

    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId && query.queryKey[1] === currentBookshelfId,
    });
  };

  useEffect(() => {
    if (!currentBookshelf) {
      setCurrentBookshelf(bookshelfData?.data.find((bookshelf) => bookshelf.id === selectedBookshelfId)?.name ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookshelfData]);

  if (previousBookshelfName === 'Wypożyczalnia' && isFetchingBookBorrowing) {
    return <Skeleton className="w-40 h-8"></Skeleton>;
  }

  if (isFetching && !isRefetching) {
    return <Skeleton className="w-40 h-8"></Skeleton>;
  }

  return (
    <>
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            size="xl"
            variant="outline"
            className="border-none text-xl"
          >
            {currentBookshelf}
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
          bookId={bookId}
          onMutated={async () => {
            setUsingBorrowFlow(false);

            await queryClient.invalidateQueries({
              predicate: ({ queryKey }) =>
                queryKey[0] === BorrowingApiQueryKeys.findBookBorrowingsQuery && queryKey[1] === bookId,
            });

            queryClient.invalidateQueries({
              queryKey: [BookApiQueryKeys.findUserBookById, bookId, userData?.id],
            });

            queryClient.invalidateQueries({
              predicate: (query) =>
                query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId &&
                query.queryKey[1] === selectedBookshelfId,
            });
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
