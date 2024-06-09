import { FindAuthorsQueryParams, FindAuthorsResponseBody } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';

type Payload = FindAuthorsQueryParams & {
  accessToken: string;
};

export const findAuthors = async (values: Payload) => {
  const { name, accessToken } = values;

  const urlSearchParams = name && name !== ''
    ? new URLSearchParams({
        name: name,
      })
    : '';

  const response = await HttpService.get<FindAuthorsResponseBody>({
    url: '/authors' + (name !== '' ? '?' + urlSearchParams.toString() : ''),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error('Error');
  }

  return response.body;
};
