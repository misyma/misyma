import { HttpService } from '../../../../core/services/httpService/httpService';
import { FindUserBooksQueryParams, FindUserBooksResponseBody } from '@common/contracts';

type Payload = FindUserBooksQueryParams & {
  accessToken: string;
  userId: string;
};

export const findBooksByBookshelfId = async (values: Payload) => {
  const { bookshelfId, accessToken } = values;

  const response = await HttpService.get<FindUserBooksResponseBody>({
    url: `/user-books?bookshelfId=${bookshelfId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.success === false) {
    throw new Error('Error');
  }

  return response.body;
};
