import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { FindBookshelfByIdParams, FindBookshelfByIdResponseBody } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { useQuery } from '@tanstack/react-query';

export const useFindBookshelfByIdQuery = (bookshelfId: string) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const findBookshelfById = async (values: FindBookshelfByIdParams) => {
    const { id } = values;

    const response = await HttpService.get<FindBookshelfByIdResponseBody>({
      url: `/bookshelves/${id}`,
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
    queryFn: () => findBookshelfById({ id: bookshelfId }),
    enabled: !!accessToken && !!bookshelfId,
  });
};
