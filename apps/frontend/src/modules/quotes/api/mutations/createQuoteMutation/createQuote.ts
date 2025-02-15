import { type CreateQuoteRequestBody, type CreateQuoteResponseBody } from '@common/contracts';

import { HttpService } from '../../../../core/services/httpService/httpService';

export interface CreateQuoteMutationPayload extends CreateQuoteRequestBody {
  accessToken: string;
  userId: string;
}

export const createQuote = async (payload: CreateQuoteMutationPayload): Promise<CreateQuoteResponseBody> => {
  const { accessToken, ...body } = payload;

  const response = await HttpService.post<CreateQuoteResponseBody>({
    url: `/quotes`,
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
