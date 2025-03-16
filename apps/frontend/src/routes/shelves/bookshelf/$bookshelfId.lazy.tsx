import { Navigate, createFileRoute } from '@tanstack/react-router';
import { type FC, useEffect } from 'react';
import { z } from 'zod';

import { FindUserBooksSortField, SortOrder } from '@common/contracts';

import { VirtualizedBooksList } from '../../../modules/book/components/organisms/virtualizedBooksList/virtualizedBooksList';
import { useFindBookshelfByIdQuery } from '../../../modules/bookshelf/api/queries/findBookshelfByIdQuery/findBookshelfByIdQuery';
import {
  BookshelfBooksPageFiltersBar,
  bookshelfBooksSearchParamsSchema,
} from '../../../modules/bookshelf/components/organisms/bookshelfBooksFiltersBar/bookshelfBooksFiltersBar';
import { BookshelfTopBar } from '../../../modules/bookshelf/components/organisms/bookshelfTopBar/bookshelfTopBar';
import {
  useBreadcrumbKeysContext,
  useBreadcrumbKeysDispatch,
} from '../../../modules/common/contexts/breadcrumbKeysContext';
import { ContentLayout } from '../../../modules/core/layouts/content/contentLayout';

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

const BookshelfBooksVirtualizedBooksList = ({
  bookshelfId,
  borrowedBooks,
}: {
  bookshelfId: string;
  borrowedBooks?: boolean;
}) => {
  const sortFieldMap = {
    createdAt: FindUserBooksSortField.createdAt,
    releaseYear: FindUserBooksSortField.releaseYear,
    rating: FindUserBooksSortField.rating,
    readingDate: FindUserBooksSortField.readingDate,
    '': undefined,
  };

  const sortOrderMap = {
    asc: SortOrder.asc,
    desc: SortOrder.desc,
    '': undefined,
  };

  const {
    genre: genreId,
    language,
    releaseYearAfter,
    releaseYearBefore,
    status,
    title,
    authorId,
    isFavorite,
    sortField,
    sortOrder,
  } = Route.useSearch();

  return (
    <VirtualizedBooksList
      bookshelfId={bookshelfId}
      borrowedBooks={borrowedBooks}
      className="h-[700px]"
      booksQueryArgs={{
        language,
        title,
        releaseYearAfter,
        releaseYearBefore,
        status,
        genreId,
        authorId,
        isFavorite: isFavorite !== '' ? (isFavorite ?? undefined) : undefined,
        sortField: sortFieldMap[sortField ?? ''],
        sortOrder: sortOrderMap[sortOrder ?? ''],
      }}
    />
  );
};

export const BorrowingBookshelf: FC = () => {
  const { bookshelfId } = Route.useParams();

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(bookshelfId);

  return (
    <div className="px-8 flex flex-col justify-center w-full items-center">
      <BookshelfTopBar
        bookshelfId={bookshelfId}
        bookshelfResponse={bookshelfResponse}
      />
      <div className="flex flex-col justify-center gap-8 w-full sm:max-w-7xl">
        <BookshelfBooksPageFiltersBar />
        <BookshelfBooksVirtualizedBooksList
          bookshelfId={bookshelfId}
          borrowedBooks={true}
        />
      </div>
    </div>
  );
};

export const Bookshelf: FC = () => {
  const { bookshelfId } = Route.useParams();

  const { data: bookshelfResponse } = useFindBookshelfByIdQuery(bookshelfId);

  return (
    <div className="px-8 flex flex-col justify-center w-full items-center">
      <BookshelfTopBar
        bookshelfId={bookshelfId}
        bookshelfResponse={bookshelfResponse}
      />
      <div
        key={bookshelfId}
        className="flex flex-col justify-center pt-2 w-full sm:max-w-7xl"
      >
        <BookshelfBooksPageFiltersBar />
        <BookshelfBooksVirtualizedBooksList bookshelfId={bookshelfId} />
      </div>
    </div>
  );
};

const bookshelfBooksPathParamsSchema = z.object({
  bookshelfId: z.string().uuid().catch(''),
});

export const Route = createFileRoute('/shelves/bookshelf/$bookshelfId')({
  component: () => {
    return (
      <ContentLayout>
        <View />
      </ContentLayout>
    );
  },
  parseParams: bookshelfBooksPathParamsSchema.parse,
  validateSearch: bookshelfBooksSearchParamsSchema,
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
