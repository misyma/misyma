import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router';
import { FC, useEffect } from 'react';
import { z } from 'zod';
import {
  FindBookshelfResponseBody,
  FindUserBooksResponseBody,
} from '@common/contracts';
import { useFindBookshelfByIdQuery } from '../../../modules/bookshelf/api/queries/findBookshelfByIdQuery/findBookshelfByIdQuery';
import {
  useBreadcrumbKeysContext,
  useBreadcrumbKeysDispatch,
} from '../../../modules/common/contexts/breadcrumbKeysContext';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../modules/core/store/states/userState/userStateSlice';
import { useErrorHandledQuery } from '../../../modules/common/hooks/useErrorHandledQuery';
import { Button } from '../../../modules/common/components/button/button';
import { useFindUserQuery } from '../../../modules/user/api/queries/findUserQuery/findUserQuery';
import { FindBooksByBookshelfIdQueryOptions } from '../../../modules/book/api/user/queries/findBooksByBookshelfId/findBooksByBookshelfIdQueryOptions';
import { AuthenticatedLayout } from '../../../modules/auth/layouts/authenticated/authenticatedLayout';
import { RequireAuthComponent } from '../../../modules/core/components/requireAuth/requireAuthComponent';
import { VirtualizedBooksList } from '../../../modules/bookshelf/components/virtualizedBooksList/virtualizedBooksList';
import { HiPlus } from 'react-icons/hi2';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../modules/common/components/tooltip/tooltip';

const bookshelfSearchSchema = z.object({
  bookshelfId: z.string().uuid().catch(''),
});

const getCountNoun = (len: number): string => {
  switch (len) {
    case 1:
      return 'książka';

    case 2:
    case 3:
    case 4:
      return 'książki';

    default:
      return 'książek';
  }
};

export const View: FC = () => {
  const { bookshelfId } = Route.useParams();

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(bookshelfId);

  const breadcrumbKeys = useBreadcrumbKeysContext();

  const dispatch = useBreadcrumbKeysDispatch();

  useEffect(() => {
    if (bookshelfResponse?.name) {
      dispatch({
        key: '$bookshelfName',
        value: bookshelfResponse?.name,
      });

      dispatch({
        key: '$bookshelfId',
        value: bookshelfResponse.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookshelfResponse]);

  useEffect(() => {
    if (breadcrumbKeys['$bookName']) {
      dispatch({
        key: '$bookName',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (bookshelfResponse?.name === 'Wypożyczalnia') {
    return <BorrowingBookshelf></BorrowingBookshelf>;
  }

  return <Bookshelf></Bookshelf>;
};

interface BookshelfTopBarProps {
  bookshelfResponse: FindBookshelfResponseBody | undefined;
  bookshelfBooksResponse: FindUserBooksResponseBody | undefined;
  bookshelfId: string;
}
const BookshelfTopBar: FC<BookshelfTopBarProps> = ({
  bookshelfResponse,
  bookshelfBooksResponse,
  bookshelfId,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between w-full sm:max-w-7xl">
      <div>
        <p className="text-xl min-h-[1.75rem] sm:min-h-[2.25rem] max-w-[40rem] truncate sm:text-3xl">
          {bookshelfResponse?.name ?? ' '}
        </p>
        <p>
          {bookshelfBooksResponse?.metadata.total ?? 0}{' '}
          {getCountNoun(bookshelfBooksResponse?.metadata.total ?? 0)}
        </p>
      </div>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="big-icon"
              onClick={() => {
                navigate({
                  to: `/shelves/bookshelf/search`,
                  search: {
                    type: 'isbn',
                    next: 0,
                    bookshelfId,
                  },
                });
              }}
            >
              <HiPlus className="w-8 h-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Stwórz książkę</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export const BorrowingBookshelf: FC = () => {
  const { bookshelfId } = Route.useParams();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: user } = useFindUserQuery();

  const { data: bookshelfBooksResponse } = useErrorHandledQuery(
    FindBooksByBookshelfIdQueryOptions({
      accessToken: accessToken as string,
      bookshelfId,
      userId: user?.id as string,
    })
  );

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(bookshelfId);

  return (
    <AuthenticatedLayout>
      <div className="px-8 flex flex-col justify-center w-full items-center">
        <BookshelfTopBar
          bookshelfBooksResponse={bookshelfBooksResponse}
          bookshelfId={bookshelfId}
          bookshelfResponse={bookshelfResponse}
        />
        <div className="flex flex-col justify-center gap-8 pt-8 w-full sm:max-w-7xl">
          <VirtualizedBooksList
            bookshelfId={bookshelfId}
            borrowedBooks={true}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const Bookshelf: FC = () => {
  const { bookshelfId } = Route.useParams();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: user } = useFindUserQuery();

  const { data: bookshelfBooksResponse } = useErrorHandledQuery(
    FindBooksByBookshelfIdQueryOptions({
      accessToken: accessToken as string,
      bookshelfId,
      userId: user?.id as string,
    })
  );

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(bookshelfId);

  return (
    <AuthenticatedLayout>
      <div className="px-8 flex flex-col justify-center w-full items-center">
        <BookshelfTopBar
          bookshelfBooksResponse={bookshelfBooksResponse}
          bookshelfId={bookshelfId}
          bookshelfResponse={bookshelfResponse}
        />
        <div
          key={bookshelfId}
          className="flex flex-col justify-center pt-2 w-full sm:max-w-7xl"
        >
          <VirtualizedBooksList bookshelfId={bookshelfId} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const Route = createFileRoute('/shelves/bookshelf/$bookshelfId')({
  component: () => {
    return (
      <RequireAuthComponent>
        <View />
      </RequireAuthComponent>
    );
  },
  parseParams: bookshelfSearchSchema.parse,
  onError: () => {
    return <Navigate to={'/mybooks'} />;
  },
  staticData: {
    routeDisplayableNameParts: [
      {
        readableName: 'Półki',
        href: '/shelves/',
      },
      {
        readableName: '$bookshelfName',
        href: `/shelves/bookshelf/$bookshelfId`,
      },
    ],
  },
});
