import {
  type FindAdminBookChangeRequestByIdResponseBody,
  type FindBookChangeRequestByIdPathParams,
} from '@common/contracts';

import { HttpService } from '../../../../../core/services/httpService/httpService';

export interface FindBookChangeRequestByIdPayload extends FindBookChangeRequestByIdPathParams {
  accessToken: string;
}

export const findBookChangeRequests = async (payload: FindBookChangeRequestByIdPayload) => {
  const { accessToken, id } = payload;

  const response = await HttpService.get<FindAdminBookChangeRequestByIdResponseBody>({
    url: `/admin/book-change-requests/${id}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error('Error');
  }

  return response.body;
};
