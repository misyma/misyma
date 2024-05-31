import { UpdateQuotePathParams, UpdateQuoteRequestBody, UpdateQuoteResponseBody } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';

export interface UpdateQuotePayload extends UpdateQuotePathParams, UpdateQuoteRequestBody {
  accessToken: string;
  userId: string;
}

export const updateQuote = async (payload: UpdateQuotePayload): Promise<UpdateQuoteResponseBody> => {
  const { accessToken, userId, userBookId, id, ...body } = payload;

  const response = await HttpService.patch<UpdateQuoteResponseBody>({
    url: `/users/${userId}/books/${userBookId}/quotes/${id}`,
    body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error(response.body.message);
  }

  return response.body;
};
