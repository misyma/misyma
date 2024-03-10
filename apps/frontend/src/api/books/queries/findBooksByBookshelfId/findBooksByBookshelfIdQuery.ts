import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { FindBooksByBookshelfIdPathParams, FindBooksByBookshelfIdResponseBody } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { useQuery } from '@tanstack/react-query';

export const useFindBooksByBookshelfIdQuery = (bookshelfId: string) => {
  const { accessToken } = useSelector(userStateSelectors.selectCurrentUserTokens) as {
    accessToken: string;
    refreshToken: string;
  };

  const findBooksByBookshelfId = async (values: FindBooksByBookshelfIdPathParams) => {
    const { bookshelfId } = values;

    const response = await HttpService.get<FindBooksByBookshelfIdResponseBody>({
      url: `/books/bookshelf/${bookshelfId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.success === false) {
      throw new Error('Error');
    }

    return response.body;
  };

    return useQuery<FindBooksByBookshelfIdResponseBody>({
        queryKey: ['findBooksByBookshelfId', bookshelfId],
        queryFn: () => findBooksByBookshelfId({ bookshelfId }),
        enabled: !!accessToken || !!bookshelfId,
    })
};
