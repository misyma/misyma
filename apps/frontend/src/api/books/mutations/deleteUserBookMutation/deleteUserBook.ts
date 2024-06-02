import { DeleteUserBookPathParams } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';

export type DeleteUserBookPayload = DeleteUserBookPathParams & {
  accessToken: string;
  userId: string;
};

export const deleteUserBook = async (payload: DeleteUserBookPayload) => {
  const { accessToken, id, userId } = payload;

  const response = await HttpService.delete({
    url: `/users/${userId}/books/${id}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error(); // todo: replace with proper error
  }

  return;
};
