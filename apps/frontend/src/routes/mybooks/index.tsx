import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { type FC } from 'react';
import { useDispatch } from 'react-redux';

import { FindUserBooksSortField, SortOrder } from '@common/contracts';

import { BookApiQueryKeys } from '../../modules/book/api/user/queries/bookApiQueryKeys.js';
import {
  BookPageFiltersBar,
  myBooksSearchParamsSchema,
} from '../../modules/book/components/bookPageFiltersBar/bookPageFiltersBar.js';
import { BooksPageTopBar } from '../../modules/book/components/booksPageTopBar/booksPageTopBar.js';
import { TitleSearchField } from '../../modules/book/components/bookTitleSearchField/bookTitleSearchField.js';
import { VirtualizedBooksList } from '../../modules/bookshelf/components/virtualizedBooksList/virtualizedBooksList.js';
import { Button } from '../../modules/common/components/button/button.js';
import { api } from '../../modules/core/apiClient/apiClient.js';
import { RequireAuthComponent } from '../../modules/core/components/requireAuth/requireAuthComponent.js';
import { ContentLayout } from '../../modules/core/layouts/content/contentLayout.js';
import { userStateActions } from '../../modules/core/store/states/userState/userStateSlice.js';

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
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const onClick = async () => {
    dispatch(userStateActions.setCurrentUserAccessToken('asd'));
    api.defaults.headers.common.Authorization = 'Bearer ';
    await queryClient.invalidateQueries({
      predicate: ({ queryKey }) => queryKey[0] === BookApiQueryKeys.findUserBooksBy,
    });
  };
  return (
    <motion.div
      key={'books-view'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full px-8"
    >
      <Button onClick={onClick}>Reset</Button>
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
