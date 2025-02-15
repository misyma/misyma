import {
  type UpdateQuotePathParams,
  type UpdateQuoteRequestBody,
  type UpdateQuoteResponseBody,
} from '@common/contracts';

import { HttpService } from '../../../../core/services/httpService/httpService';

export interface UpdateQuotePayload extends UpdateQuotePathParams, UpdateQuoteRequestBody {
  accessToken: string;
}

export const updateQuote = async (payload: UpdateQuotePayload): Promise<UpdateQuoteResponseBody> => {
  const { accessToken, quoteId, ...body } = payload;

  const response = await HttpService.patch<UpdateQuoteResponseBody>({
    url: `/quotes/${quoteId}`,
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
