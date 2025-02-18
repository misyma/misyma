import { type FindAdminBookChangeRequestResponseBody, type FindBookChangeRequestPathParams } from '@common/contracts';

import { HttpService } from '../../../../../core/services/httpService/httpService';

export interface FindBookChangeRequestByIdPayload extends FindBookChangeRequestPathParams {
  accessToken: string;
}

export const findBookChangeRequests = async (payload: FindBookChangeRequestByIdPayload) => {
  const { accessToken, bookChangeRequestId } = payload;

  const response = await HttpService.get<FindAdminBookChangeRequestResponseBody>({
    url: `/admin/book-change-requests/${bookChangeRequestId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error('Error');
  }

  return response.body;
};
