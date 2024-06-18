import { queryOptions } from '@tanstack/react-query';
import { FindBookBorrowingsPayload, findBookBorrowings } from './findBookBorrowings';
import { BorrowingApiQueryKeys } from '../borrowingApiQueryKeys';

export const FindBookBorrowingsQueryOptions = ({
  accessToken,
  userBookId,
  page,
  pageSize,
  sortDate,
}: FindBookBorrowingsPayload) =>
  queryOptions({
    queryKey: [BorrowingApiQueryKeys.findBookBorrowingsQuery, userBookId, page, pageSize, sortDate],
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
