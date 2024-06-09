import { useSelector } from 'react-redux';
import { FindBookshelfByIdParams, FindBookshelfByIdResponseBody } from '@common/contracts';
import { useQuery } from '@tanstack/react-query';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { HttpService } from '../../../../core/services/httpService/httpService';

export const useFindBookshelfByIdQuery = (bookshelfId: string) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const findBookshelfById = async (values: FindBookshelfByIdParams) => {
    const { bookshelfId } = values;

    const response = await HttpService.get<FindBookshelfByIdResponseBody>({
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

  return useQuery<FindBookshelfByIdResponseBody>({
    queryKey: ['findBookshelfById', bookshelfId],
    queryFn: () => findBookshelfById({ bookshelfId }),
    enabled: !!accessToken && !!bookshelfId,
  });
};
