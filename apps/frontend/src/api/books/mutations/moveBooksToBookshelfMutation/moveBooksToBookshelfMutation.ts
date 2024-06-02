import { UpdateUserBooksRequestBody } from '@common/contracts';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice.js';
import { HttpService } from '../../../../core/services/httpService/httpService.js';
import { BookApiError } from '../../errors/bookApiError.js';

type Payload = UpdateUserBooksRequestBody;

export const useMoveBooksToBookshelfMutation = (options: UseMutationOptions<void, BookApiError, Payload>) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const updateBookshelf = async (payload: Payload) => {
    const response = await HttpService.patch<void>({
      url: '/user-books',
      body: payload as unknown as Record<string, string>,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.success) {
      throw new BookApiError({
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
