import { type UseMutationOptions } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { type CreateBookshelfRequestBody, type CreateBookshelfResponseBody } from '@common/contracts';

import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { ShelfApiError } from '../../errors/shelfApiError';

type CreateBookshelfPayload = CreateBookshelfRequestBody;

export const useCreateBookshelfMutation = (
  options: UseMutationOptions<CreateBookshelfResponseBody, ShelfApiError, CreateBookshelfPayload>,
) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const createBookshelf = async (payload: CreateBookshelfPayload) => {
    const response = await HttpService.post<CreateBookshelfResponseBody>({
      url: `/bookshelves`,
      body: payload as unknown as Record<string, unknown>,
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

  return useErrorHandledMutation({
    mutationFn: createBookshelf,
    ...options,
  });
};
