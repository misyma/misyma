import { CreateBookshelfRequestBody, CreateBookshelfResponseBody } from '@common/contracts';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { ShelfApiError } from '../../errors/shelfApiError';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { HttpService } from '../../../../core/services/httpService/httpService';

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

  return useMutation({
    mutationFn: createBookshelf,
    ...options,
  })
};
