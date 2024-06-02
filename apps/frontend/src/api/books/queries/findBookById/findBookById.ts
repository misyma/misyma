import { FindBookPathParams, FindBookResponseBody } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';

export interface FindBookByIdPayload extends FindBookPathParams {
  accessToken: string;
}

export const findBookById = async (payload: FindBookByIdPayload): Promise<FindBookResponseBody> => {
  const response = await HttpService.get<FindBookResponseBody>({
    url: `/books/${payload.id}`,
    headers: {
      Authorization: `Bearer ${payload.accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error(response.body.message);
  }

  return response.body;
};
