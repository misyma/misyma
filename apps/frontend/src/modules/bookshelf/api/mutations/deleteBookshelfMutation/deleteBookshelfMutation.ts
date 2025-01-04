import { type UseMutationOptions } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { type DeleteBookshelfParams, type DeleteBookshelfQueryParams } from '@common/contracts';

import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { HttpService, type RequestPayload } from '../../../../core/services/httpService/httpService';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { ShelfApiError } from '../../errors/shelfApiError';

type Payload = DeleteBookshelfParams & DeleteBookshelfQueryParams;

export const useDeleteBookshelfMutation = (options: UseMutationOptions<void, ShelfApiError, Payload>) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const deleteBookshelf = async (payload: Payload) => {
    const deletePayload: RequestPayload = {
      url: `/bookshelves/${payload.bookshelfId}`,
      body: payload as unknown as Record<string, string>,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    if (payload.fallbackBookshelfId) {
      deletePayload.queryParams = {
        fallbackBookshelfId: payload.fallbackBookshelfId,
      };
    }

    const response = await HttpService.delete(deletePayload);

    if (!response.success) {
      throw new ShelfApiError({
        apiResponseError: response.body.context,
        message: response.body.message,
        statusCode: response.statusCode,
      });
    }

    return response.body;
  };

  return useErrorHandledMutation({
    mutationFn: deleteBookshelf,
    ...options,
  });
};
