import { FC, useEffect, useMemo, useState } from 'react';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '../../../common/components/ui/skeleton';
import { useToast } from '../../../common/components/ui/use-toast';
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
import { Command } from 'cmdk';
import { CommandInput, CommandItem, CommandList } from '../../../common/components/ui/command';
import { Popover, PopoverContent } from '../../../common/components/ui/popover';
import { PopoverTrigger } from '@radix-ui/react-popover';
import { Button } from '../../../common/components/ui/button';

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

  const { data: bookshelfData } = useFindUserBookshelfsQuery({
    userId: userData?.id as string,
    pageSize: 50,
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
          <Button className="sm:w-60 bg-transparent border-none text-primary text-xl">
            {bookshelfData?.data.find((bookshelf) => bookshelf.id === selectedBookshelfId)?.name}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Command>
            <CommandInput placeholder="Search framework..." />
            {isFetched && (!isRefetching || (isFetching && isRefetching)) && (
              <CommandList>
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

                      setOpen(false);
                    }}
                  >
                    {bookshelf.name}
                  </CommandItem>
                ))}
              </CommandList>
            )}
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
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
};
