import { FC, useMemo, useState } from 'react';
import { useFindUserBookshelfsQuery } from '../../../../api/bookshelf/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { useFindUserQuery } from '../../../../api/user/queries/findUserQuery/findUserQuery';
import { useUpdateUserBookMutation } from '../../../../api/books/mutations/updateUserBookMutation/updateUserBookMutation';
import { useFindUserBookQuery } from '../../../../api/books/queries/findUserBook/findUserBookQuery';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '../../../../components/ui/skeleton';
import { useToast } from '../../../../components/ui/use-toast';

interface Props {
  bookId: string;
}

export const BookshelfChoiceDropdown: FC<Props> = ({ bookId }) => {
  const queryClient = useQueryClient();

  const { data: userData } = useFindUserQuery();

  const { data, isFetching, isFetched, isRefetching } = useFindUserBookQuery({
    userBookId: bookId,
    userId: userData?.id ?? '',
  });

  const { toast } = useToast()


  const { data: bookshelfData } = useFindUserBookshelfsQuery(userData?.id ?? '');

  const [selectedBookshelfId, setSelectedBookshelfId] = useState(data?.bookshelfId ?? '');

  const booksBookshelf = useMemo(() => {
    return bookshelfData?.data.find((bookshelf) => data?.bookshelfId === bookshelf.id);
  }, [bookshelfData, data]);

  const { mutateAsync: updateUserBook } = useUpdateUserBookMutation({});

  const onBookshelfChange = async (id: string): Promise<void> => {
    await updateUserBook({
      userBookId: bookId,
      bookshelfId: id,
    });

    toast({
      title: `Zmieniono półkę.`,
      description: `Książka znajduje się teraz na: XD`,
      variant: 'success',
  })

    queryClient.invalidateQueries({
      queryKey: ['findUserBookById', bookId, userData?.id],
    });
  };

  return (
    <>
      {(isFetching && !isRefetching) && (
        <>
          <Skeleton className="w-40 h-8"></Skeleton>
        </>
      )}
      {isFetched && (!isRefetching || (isFetching && isRefetching)) && (
        <Select
          value={selectedBookshelfId}
          onValueChange={async (value) => {
            await onBookshelfChange(value);

            setSelectedBookshelfId(value);
          }}
        >
          <SelectTrigger className="sm:w-60 bg-transparent border-none text-primary font-semibold text-xl items-center justify-end">
            <SelectValue
              defaultValue={booksBookshelf?.id}
              placeholder="Półka"
            ></SelectValue>
            <SelectContent className="sm:w-40">
              {bookshelfData?.data.map((bookshelf) => <SelectItem value={bookshelf.id}>{bookshelf.name}</SelectItem>)}
            </SelectContent>
          </SelectTrigger>
        </Select>
      )}
    </>
  );
};
