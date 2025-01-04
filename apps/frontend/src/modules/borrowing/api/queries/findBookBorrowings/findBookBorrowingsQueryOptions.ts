import { queryOptions } from '@tanstack/react-query';

import { type FindBookBorrowingsPayload, findBookBorrowings } from './findBookBorrowings';
import { BorrowingApiQueryKeys } from '../borrowingApiQueryKeys';

export const FindBookBorrowingsQueryOptions = ({
  accessToken,
  userBookId,
  page,
  pageSize,
  sortDate,
  isOpen,
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
        isOpen,
      }),
  });
