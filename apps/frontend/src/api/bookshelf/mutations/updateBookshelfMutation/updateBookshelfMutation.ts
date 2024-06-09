import { UpdateBookshelfPathParams, UpdateBookshelfRequestBody, UpdateBookshelfResponseBody } from '@common/contracts';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { ShelfApiError } from '../../errors/shelfApiError';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice';
import { HttpService } from '../../../../modules/core/services/httpService/httpService';

type Payload = UpdateBookshelfRequestBody & UpdateBookshelfPathParams;

export const useUpdateBookshelfMutation = (
  options: UseMutationOptions<UpdateBookshelfResponseBody, ShelfApiError, Payload>,
) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const updateBookshelf = async (payload: Payload) => {
    const response = await HttpService.patch<UpdateBookshelfResponseBody>({
      url: `/bookshelves/${payload.bookshelfId}`,
      body: payload as unknown as Record<string, string>,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.success) {
      throw new ShelfApiError({
        apiResponseError: response.body.context,
        message: response.body.message,
        statusCode: response.statusCode,
      });
    }

    return response.body;
  };

  return useMutation({
    mutationFn: updateBookshelf,
    ...options,
  });
};
