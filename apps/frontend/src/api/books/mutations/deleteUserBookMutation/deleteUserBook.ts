import { DeleteUserBookPathParams } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';

export type DeleteUserBookPayload = DeleteUserBookPathParams & {
  accessToken: string;
};

export const deleteUserBook = async (payload: DeleteUserBookPayload) => {
  const { accessToken, userBookId } = payload;

  const response = await HttpService.delete({
    url: `/user-books/${userBookId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error(); // todo: replace with proper error
  }

  return;
};
