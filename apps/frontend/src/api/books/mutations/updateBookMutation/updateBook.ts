import { UpdateBookPathParams, UpdateBookRequestBody } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';

export interface UpdateBookPayload extends UpdateBookPathParams, UpdateBookRequestBody {
  accessToken: string;
}

export const updateBook = async (payload: UpdateBookPayload): Promise<void> => {
  const { accessToken, id, ...rest } = payload;

  const response = await HttpService.patch({
    url: `/admin/books/${id}`,
    body: rest,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error(response.body.message);
  }
};
