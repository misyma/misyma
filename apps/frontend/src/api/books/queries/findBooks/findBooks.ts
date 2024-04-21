import { FindBooksQueryParams, FindBooksResponseBody } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';

type Payload = FindBooksQueryParams & {
  accessToken: string;
};

export const findBooks = async (values: Payload) => {
  const { accessToken, isbn, title } = values;

  const response = await HttpService.get<FindBooksResponseBody>({
    url: `/books`,
    queryParams: {
      isbn: isbn as string, //todo
      title: title as string, //todo
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error('Error');
  }

  return response.body;
};
