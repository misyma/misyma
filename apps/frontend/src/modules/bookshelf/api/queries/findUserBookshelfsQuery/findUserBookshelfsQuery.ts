import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { type FindBookshelvesQueryParams, type FindBookshelvesResponseBody } from '@common/contracts';

import { HttpService } from '../../../../core/services/httpService/httpService';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { BookshelvesApiQueryKeys } from '../bookshelvesApiQueryKeys';

type Payload = FindBookshelvesQueryParams & {
  userId: string;
};

export const useFindUserBookshelfsQuery = (payload: Payload) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const findUserBookshelfs = async () => {
    const { page, pageSize, name } = payload;

    const queryParams: Record<string, string> = {
      sortDate: 'desc',
    };

    if (page) {
      queryParams['page'] = `${page}`;
    }

    if (pageSize) {
      queryParams['pageSize'] = `${pageSize}`;
    }

    if (name) {
      queryParams['name'] = name;
    }

    const response = await HttpService.get<FindBookshelvesResponseBody>({
      url: '/bookshelves',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      queryParams,
    });

    if (response.success === false) {
      throw new Error('Error');
    }

    return response.body;
  };

  return useQuery<FindBookshelvesResponseBody>({
    queryKey: [BookshelvesApiQueryKeys.findUserBookshelfs, payload.page, payload.pageSize, payload.name],
    queryFn: () => findUserBookshelfs(),
    enabled: !!accessToken && !!payload.userId,
    placeholderData: keepPreviousData,
  });
};
