import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { type FC } from 'react';

import { FindUserBooksSortField, SortOrder } from '@common/contracts';

import { TitleSearchField } from '../../modules/book/components/atoms/bookTitleSearchField/bookTitleSearchField.js';
import {
  BookPageFiltersBar,
  myBooksSearchParamsSchema,
} from '../../modules/book/components/organisms/bookPageFiltersBar/bookPageFiltersBar.js';
import { BooksPageTopBar } from '../../modules/book/components/organisms/booksPageTopBar/booksPageTopBar.js';
import { VirtualizedBooksList } from '../../modules/book/components/organisms/virtualizedBooksList/virtualizedBooksList.js';
import { RequireAuthComponent } from '../../modules/core/components/requireAuth/requireAuthComponent.js';
import { ContentLayout } from '../../modules/core/layouts/content/contentLayout.js';

const MyBooksVirtualizedBooksList = () => {
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

const BooksPage: FC = () => {
  return (
    <motion.div
      key={'books-view'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full px-8"
    >
      <BookPageFiltersBar />
      <MyBooksVirtualizedBooksList />
    </motion.div>
  );
};

const View: FC = () => {
  return (
    <ContentLayout>
      <div className="w-full px-8 flex justify-between items-center gap-4 pb-4">
        <TitleSearchField />
        <BooksPageTopBar />
      </div>
      <BooksPage />
    </ContentLayout>
  );
};

export const Route = createFileRoute('/mybooks/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <View />
      </RequireAuthComponent>
    );
  },
  staticData: {},
  validateSearch: myBooksSearchParamsSchema,
});
