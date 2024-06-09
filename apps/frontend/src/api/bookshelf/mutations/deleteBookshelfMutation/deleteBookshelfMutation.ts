import { DeleteBookshelfParams, } from '@common/contracts';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { ShelfApiError } from '../../errors/shelfApiError';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../modules/core/store/states/userState/userStateSlice';
import { HttpService } from '../../../../modules/core/services/httpService/httpService';

type Payload = DeleteBookshelfParams;

export const useDeleteBookshelfMutation = (
  options: UseMutationOptions<void, ShelfApiError, Payload>,
) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const deleteBookshelf = async (payload: Payload) => {
    const response = await HttpService.delete({
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
    mutationFn: deleteBookshelf,
    ...options,
  });
};
