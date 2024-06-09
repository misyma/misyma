import { CreateQuotePathParams, CreateQuoteRequestBody, CreateQuoteResponseBody } from '@common/contracts';
import { HttpService } from '../../../../modules/core/services/httpService/httpService';

export interface CreateQuoteMutationPayload extends CreateQuotePathParams, CreateQuoteRequestBody {
  accessToken: string;
  userId: string;
}

export const createQuote = async (payload: CreateQuoteMutationPayload): Promise<CreateQuoteResponseBody> => {
  const { accessToken, userBookId, ...body } = payload;

  const response = await HttpService.post<CreateQuoteResponseBody>({
    url: `/user-books/${userBookId}/quotes`,
    body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error(response.body.message); // todo: dedicated api error
  }

  return response.body;
};
