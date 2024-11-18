import { HiArrowsRightLeft } from 'react-icons/hi2';
import { Button } from '../../../common/components/button/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../common/components/tooltip/tooltip';
import { FC, forwardRef, useMemo, useState } from 'react';
import { useFindBookshelfByIdQuery } from '../../../bookshelf/api/queries/findBookshelfByIdQuery/findBookshelfByIdQuery';
import { useQueryClient } from '@tanstack/react-query';
import { FindUserBookByIdQueryOptions } from '../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { cn } from '../../../common/lib/utils';
import { CreateBorrowingModal } from '../createBorrowingModal/createBorrowingModal';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys';
import { BookshelvesApiQueryKeys } from '../../../bookshelf/api/queries/bookshelvesApiQueryKeys';
import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery';

interface BorrowBookIconProps {
  isBorrowingBookshelf: boolean;
  onClick: () => void;
}

const BorrowBookIcon = forwardRef<HTMLButtonElement, BorrowBookIconProps>(
  ({ isBorrowingBookshelf, onClick }, ref) => {
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
          className={cn(
            'cursor-pointer text-primary h-8 w-8',
            isBorrowingBookshelf ? 'text-disabled' : ''
          )}
          onClick={onClick}
        ></HiArrowsRightLeft>
      </Button>
    );
  }
);

interface BorrowBookButtonProps {
  bookId: string;
}
export const BorrowBookButton: FC<BorrowBookButtonProps> = ({ bookId }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);
  const [createBookBorrowingModalOpen, setCreateBookBorrowingModalOpen] =
    useState(false);

  const { data: userData } = useFindUserQuery();

  const queryClient = useQueryClient();

  const { data } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    })
  );

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(
    data?.bookshelfId as string
  );

  const isBorrowingBookshelf = useMemo(
    () => bookshelfResponse?.name === 'Wypożyczalnia',
    [bookshelfResponse?.name]
  );

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
          bookId={bookId}
          open={createBookBorrowingModalOpen}
          onMutated={async () => {
            queryClient.invalidateQueries({
              predicate: (query) =>
                query.queryKey[0] === BookApiQueryKeys.findBooksByBookshelfId &&
                query.queryKey[1] === bookshelfResponse?.id,
            });

            queryClient.invalidateQueries({
              predicate: (query) =>
                query.queryKey[0] === BookApiQueryKeys.findUserBookById &&
                query.queryKey[1] === bookId,
            });

            queryClient.invalidateQueries({
              predicate: (query) =>
                query.queryKey[0] ===
                BookshelvesApiQueryKeys.findUserBookshelfs,
            });

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
