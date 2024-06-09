import { FC, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../modules/common/components/ui/select';
import { useFindUserQuery } from '../../../../modules/user/api/queries/findUserQuery/findUserQuery';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '../../../../modules/common/components/ui/skeleton';
import { useToast } from '../../../../modules/common/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice';
import { FindUserBookQueryOptions } from '../../../../modules/book/api/queries/findUserBook/findUserBookQueryOptions';
import { useFindUserBookshelfsQuery } from '../../../../modules/bookshelf/api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { useUpdateUserBookMutation } from '../../../../modules/book/api/mutations/updateUserBookMutation/updateUserBookMutation';

interface Props {
  bookId: string;
}

export const BookshelfChoiceDropdown: FC<Props> = ({ bookId }) => {
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
      accessToken: accessToken as string,
    });

    toast({
      title: `Zmieniono półkę.`,
      description: `Książka znajduje się teraz na: XD`,
      variant: 'success',
    });

    queryClient.invalidateQueries({
      queryKey: ['findUserBookById', bookId, userData?.id],
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
