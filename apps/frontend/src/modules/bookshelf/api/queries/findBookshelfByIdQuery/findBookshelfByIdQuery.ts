import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { type FindBookshelfParams, type FindBookshelfResponseBody } from '@common/contracts';

import { HttpService } from '../../../../core/services/httpService/httpService';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { BookshelvesApiQueryKeys } from '../bookshelvesApiQueryKeys';

export const useFindBookshelfByIdQuery = (bookshelfId: string) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const findBookshelfById = async (values: FindBookshelfParams) => {
    const { bookshelfId } = values;

    const response = await HttpService.get<FindBookshelfResponseBody>({
      url: `/bookshelves/${bookshelfId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.success === false) {
      throw new Error('Error');
    }

    return response.body;
  };

  return useQuery<FindBookshelfResponseBody>({
    queryKey: [BookshelvesApiQueryKeys.findBookshelfById, bookshelfId],
    queryFn: () => findBookshelfById({ bookshelfId }),
    enabled: !!accessToken && !!bookshelfId,
  });
};
