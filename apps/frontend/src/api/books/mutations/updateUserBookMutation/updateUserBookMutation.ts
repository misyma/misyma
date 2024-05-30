import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice.js';
import {
  UpdateUserBookPathParams,
  UpdateUserBookRequestBody,
  UpdateUserBookResponseBody,
  UploadUserBookImageResponseBody,
} from '@common/contracts';
import { BookApiError } from '../../errors/bookApiError.js';
import { HttpService } from '../../../../core/services/httpService/httpService.js';

type Payload = UpdateUserBookPathParams &
  UpdateUserBookRequestBody & {
    userId: string;
  };

export const useUpdateUserBookMutation = (
  options: UseMutationOptions<UpdateUserBookResponseBody, BookApiError, Payload>,
) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const uploadImage = async (payload: Payload) => {
    const { userBookId, userId, ...rest } = payload;

    const response = await HttpService.patch<UploadUserBookImageResponseBody>({
      url: `/users/${userId}/books/${userBookId}`,
      // eslint-disable-next-line
      body: rest as any,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.success) {
      throw new BookApiError({
        apiResponseError: response.body.context,
        message: mapErrorCodeToErrorMessage(response.statusCode),
        statusCode: response.statusCode,
      });
    }

    return response.body;
  };

  return useMutation({
    mutationFn: uploadImage,
    ...options,
  });
};

const mapErrorCodeToErrorMessage = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return `Podano błędne dane.`;

    case 403:
      return `Brak pozwolenia na zaaktualizowanie danych książki.`;

    case 500:
      return `Wewnętrzny błąd serwera.`;

    default:
      return 'Nieznany błąd.';
  }
};
