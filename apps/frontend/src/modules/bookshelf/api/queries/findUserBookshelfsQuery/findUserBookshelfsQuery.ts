import { useSelector } from 'react-redux';
import { FindBookshelvesByUserIdQueryParams, FindBookshelvesByUserIdResponseBody } from '@common/contracts';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { BookshelvesApiQueryKeys } from '../bookshelvesApiQueryKeys';

type Payload = FindBookshelvesByUserIdQueryParams & {
  userId: string;
};

export const useFindUserBookshelfsQuery = (payload: Payload) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const findUserBookshelfs = async () => {
    const { page, pageSize } = payload;

    const response = await HttpService.get<FindBookshelvesByUserIdResponseBody>({
      url: '/bookshelves',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      queryParams: {
        page: `${page}`,
        pageSize: `${pageSize}`,
      },
    });

    if (response.success === false) {
      throw new Error('Error');
    }

    return response.body;
  };

  return useQuery<FindBookshelvesByUserIdResponseBody>({
    queryKey: [BookshelvesApiQueryKeys.findUserBookshelfs, payload.page, payload.pageSize],
    queryFn: () => findUserBookshelfs(),
    enabled: !!accessToken && !!payload.userId,
    placeholderData: keepPreviousData,
  });
};
