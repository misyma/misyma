import { useEffect, useState } from 'react';

import { BookshelfType } from '@common/contracts';

import { useFindUserQuery } from '../../../../../user/api/queries/findUserQuery/findUserQuery';
import { useFindUserBookshelfsQuery } from '../../../../api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';

interface UseBookshelvesProps {
  pageSize: number;
  page: number;
  name: string | undefined;
}
export const useBookshelves = ({ name, page, pageSize }: UseBookshelvesProps) => {
  const { data: user } = useFindUserQuery();

  const { data: bookshelvesData } = useFindUserBookshelfsQuery({
    pageSize,
    page,
    name,
  });

  const [bookshelves, setBookshelves] = useState(bookshelvesData?.data ?? []);

  useEffect(() => {
    if (bookshelvesData?.data) {
      setBookshelves(bookshelvesData.data);
    }
  }, [bookshelvesData?.data]);

  const createBookshelfDraft = () => {
    return {
      id: '',
      createdAt: new Date().toISOString(),
      name: '',
      type: BookshelfType.standard,
      userId: user?.id as string,
    };
  };

  return {
    bookshelves,
    setBookshelves,
    createBookshelfDraft,
  };
};
