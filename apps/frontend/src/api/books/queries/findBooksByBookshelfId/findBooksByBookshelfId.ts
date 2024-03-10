import { FindBooksByBookshelfIdPathParams, FindBooksByBookshelfIdResponseBody } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';

type Payload = FindBooksByBookshelfIdPathParams & {
  accessToken: string;
};

export const findBooksByBookshelfId = async (values: Payload) => {
  const { bookshelfId, accessToken } = values;

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
