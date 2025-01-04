import { useQueryClient } from '@tanstack/react-query';
import { type FC, forwardRef, useMemo, useState } from 'react';
import { HiArrowsRightLeft } from 'react-icons/hi2';
import { useSelector } from 'react-redux';

import { BookshelvesApiQueryKeys } from '../../../bookshelf/api/queries/bookshelvesApiQueryKeys';
import { useFindBookshelfByIdQuery } from '../../../bookshelf/api/queries/findBookshelfByIdQuery/findBookshelfByIdQuery';
import { Button } from '../../../common/components/button/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../common/components/tooltip/tooltip';
import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery';
import { cn } from '../../../common/lib/utils';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys';
import { invalidateBooksByBookshelfIdQuery } from '../../api/user/queries/findBooksByBookshelfId/findBooksByBookshelfIdQueryOptions';
import { FindUserBookByIdQueryOptions } from '../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { invalidateFindUserBooksByQuery } from '../../api/user/queries/findUserBookBy/findUserBooksByQueryOptions';
import { CreateBorrowingModal } from '../createBorrowingModal/createBorrowingModal';

interface BorrowBookIconProps {
  isBorrowingBookshelf: boolean;
  onClick: () => void;
}

const BorrowBookIcon = forwardRef<HTMLButtonElement, BorrowBookIconProps>(({ isBorrowingBookshelf, onClick }, ref) => {
  return (
    <Button
      disabled={isBorrowingBookshelf}
      onClick={onClick}
      variant="ghost"
      size="icon"
      style={{
        background: 'none',
      }}
      ref={ref}
    >
      <HiArrowsRightLeft
        className={cn('cursor-pointer text-primary h-8 w-8', isBorrowingBookshelf ? 'text-disabled' : '')}
        onClick={onClick}
      ></HiArrowsRightLeft>
    </Button>
  );
});

interface BorrowBookButtonProps {
  bookId: string;
  currentBookshelfId: string;
}
export const BorrowBookButton: FC<BorrowBookButtonProps> = ({ bookId, currentBookshelfId }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const [createBookBorrowingModalOpen, setCreateBookBorrowingModalOpen] = useState(false);

  const { data: userData } = useFindUserQuery();

  const queryClient = useQueryClient();

  const { data } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(data?.bookshelfId as string);

  const isBorrowingBookshelf = useMemo(() => bookshelfResponse?.name === 'Wypożyczalnia', [bookshelfResponse?.name]);

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <BorrowBookIcon
              isBorrowingBookshelf={isBorrowingBookshelf}
              onClick={() => setCreateBookBorrowingModalOpen(true)}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Wypożycz książkę</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {createBookBorrowingModalOpen && (
        <CreateBorrowingModal
          currentBookshelfId={currentBookshelfId}
          bookId={bookId}
          open={createBookBorrowingModalOpen}
          onMutated={async () => {
            await Promise.all([
              queryClient.invalidateQueries({
                predicate: (query) =>
                  query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId &&
                  query.queryKey[1] === bookshelfResponse?.id,
              }),
              queryClient.invalidateQueries({
                predicate: (query) =>
                  query.queryKey[0] === BookApiQueryKeys.findUserBookById && query.queryKey[1] === bookId,
              }),
              queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === BookshelvesApiQueryKeys.findUserBookshelfs,
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
              queryClient.invalidateQueries({
                predicate: ({ queryKey }) =>
                  invalidateBooksByBookshelfIdQuery(
                    {
                      bookshelfId: currentBookshelfId,
                    },
                    queryKey,
                  ),
              }),
            ]);

            setCreateBookBorrowingModalOpen(false);
          }}
          onClosed={() => {
            setCreateBookBorrowingModalOpen(false);
          }}
        />
      )}
    </>
  );
};
