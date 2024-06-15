import { queryOptions } from '@tanstack/react-query';
import { FindBookBorrowingsPayload, findBookBorrowings } from './findBookBorrowings';

export const FindBookBorrowingsQueryOptions = ({
  accessToken,
  userBookId,
  page,
  pageSize,
  sortDate,
}: FindBookBorrowingsPayload) =>
  queryOptions({
    queryKey: [`findBookBorrowingsQuery`, userBookId, page, pageSize, sortDate],
    enabled: !!accessToken,
    queryFn: () =>
      findBookBorrowings({
        accessToken,
        userBookId,
        page,
        pageSize,
        sortDate,
      }),
  });
