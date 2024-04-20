import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { FindBookshelvesByUserIdParams, FindBookshelvesByUserIdResponseBody } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { useQuery } from '@tanstack/react-query';

export const useFindUserBookshelfsQuery = (userId: string | undefined) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const findUserBookshelfs = async (values: FindBookshelvesByUserIdParams) => {
    const { userId } = values;

    const response = await HttpService.get<FindBookshelvesByUserIdResponseBody>({
      url: `/bookshelves/user/${userId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.success === false) {
      throw new Error('Error');
    }

    return response.body;
  };

  return useQuery<FindBookshelvesByUserIdResponseBody>({
    queryKey: ['findUserBookshelfs', userId],
    queryFn: () => findUserBookshelfs({ userId: userId as string }), // todo: improve
    enabled: !!accessToken || !!userId,
  });
};
