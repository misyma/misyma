import { HttpService } from '../../../../core/services/httpService/httpService';
import { FindUserBooksPathParams, FindUserBooksResponseBody } from '@common/contracts';

type Payload = FindUserBooksPathParams & {
  accessToken: string;
  userId: string;
};

export const findBooksByBookshelfId = async (values: Payload) => {
  const { bookshelfId, userId, accessToken } = values;

  const response = await HttpService.get<FindUserBooksResponseBody>({
    url: `/users/${userId}/books/bookshelf/${bookshelfId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.success === false) {
    throw new Error('Error');
  }

  return response.body;
};
