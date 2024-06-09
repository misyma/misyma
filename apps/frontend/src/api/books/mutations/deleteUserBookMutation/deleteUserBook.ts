import { DeleteUserBookPathParams } from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { ErrorCodeMessageMapper } from '../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { BookApiError } from '../../errors/bookApiError';

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
    const mapper = new ErrorCodeMessageMapper({});

    throw new BookApiError({
      apiResponseError: response.body.context,
      message: mapper.map(response.statusCode),
      statusCode: response.statusCode,
    });
  }

  return;
};
