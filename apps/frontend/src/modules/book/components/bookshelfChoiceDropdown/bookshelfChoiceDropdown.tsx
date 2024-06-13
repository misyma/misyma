import { FC, useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../common/components/ui/select';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '../../../common/components/ui/skeleton';
import { useToast } from '../../../common/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { FindUserBookQueryOptions } from '../../api/queries/findUserBook/findUserBookQueryOptions';
import { useFindUserBookshelfsQuery } from '../../../bookshelf/api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { useUpdateUserBookMutation } from '../../api/mutations/updateUserBookMutation/updateUserBookMutation';
import { CreateBorrowingModal } from '../createBorrowingModal/createBorrowingModal';

interface Props {
  bookId: string;
  currentBookshelfId: string;
}

export const BookshelfChoiceDropdown: FC<Props> = ({ bookId, currentBookshelfId }) => {
  const queryClient = useQueryClient();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: userData } = useFindUserQuery();

  const { data, isFetching, isFetched, isRefetching } = useQuery(
    FindUserBookQueryOptions({
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

  const [usingBorrowFlow, setUsingBorrowFlow] = useState(false);

  const [selectedBookshelfId, setSelectedBookshelfId] = useState(data?.bookshelfId ?? '');

  const [previousBookshelfId, setPreviousBookshelfId] = useState<string | null>(null);

  const booksBookshelf = useMemo(() => {
    return bookshelfData?.data.find((bookshelf) => data?.bookshelfId === bookshelf.id);
  }, [bookshelfData, data]);

  const { mutateAsync: updateUserBook } = useUpdateUserBookMutation({});

  const onBookshelfChange = async (id: string, bookshelfName: string): Promise<void> => {
    if (bookshelfName === 'Wypożyczalnia') {
      return setUsingBorrowFlow(true);
    }

    await updateUserBook({
      userBookId: bookId,
      bookshelfId: id,
      accessToken: accessToken as string,
    });

    toast({
      title: `Zmieniono półkę.`,
      description: `Książka znajduje się teraz na: ${bookshelfName}`,
      variant: 'success',
    });

    queryClient.invalidateQueries({
      queryKey: ['findUserBookById', bookId, userData?.id],
    });

    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'findBooksByBookshelfId' && query.queryKey[1] === id,
    });

    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'findBooksByBookshelfId' && query.queryKey[1] === currentBookshelfId,
    });
  };

  return (
    <>
      {isFetching && !isRefetching && (
        <>
          <Skeleton className="w-40 h-8"></Skeleton>
        </>
      )}
      {isFetched && (!isRefetching || (isFetching && isRefetching)) && (
        <Select
          value={selectedBookshelfId}
          onValueChange={async (value) => {
            setPreviousBookshelfId(selectedBookshelfId);

            await onBookshelfChange(value, bookshelfData?.data.find((bookshelf) => bookshelf.id === value)?.name ?? '');

            setSelectedBookshelfId(value);
          }}
        >
          <SelectTrigger className="sm:w-60 bg-transparent border-none text-primary font-semibold text-xl items-center justify-end">
            <SelectValue
              defaultValue={booksBookshelf?.id}
              placeholder="Półka"
            ></SelectValue>
            <SelectContent className="sm:w-60">
              {bookshelfData?.data.map((bookshelf) => <SelectItem value={bookshelf.id}>{bookshelf.name}</SelectItem>)}
            </SelectContent>
          </SelectTrigger>
        </Select>
      )}
      {usingBorrowFlow && (
        <CreateBorrowingModal
          bookId={bookId}
          onMutated={async () => {
            setUsingBorrowFlow(false);

            queryClient.invalidateQueries({
              queryKey: ['findUserBookById', bookId, userData?.id],
            });

            queryClient.invalidateQueries({
              predicate: (query) =>
                query.queryKey[0] === 'findBooksByBookshelfId' && query.queryKey[1] === currentBookshelfId,
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
