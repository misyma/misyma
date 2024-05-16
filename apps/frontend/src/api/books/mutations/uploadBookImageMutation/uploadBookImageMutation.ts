import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice.js';
import { UploadUserBookImageResponseBody } from '@common/contracts';
import { BookApiError } from '../../errors/bookApiError.js';
import { HttpService } from '../../../../core/services/httpService/httpService.js';

type Payload = {
  userId: string;
  bookId: string;
  file: File;
};

export const useUploadBookImageMutation = (
  options: UseMutationOptions<UploadUserBookImageResponseBody, BookApiError, Payload>,
) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const uploadImage = async (payload: Payload) => {
    const { bookId, file, userId } = payload;

    const formData = new FormData();

    formData.append('attachedFiles', file, file.name);

    const response = await HttpService.patch<UploadUserBookImageResponseBody>({
      url: `/users/${userId}/books/${bookId}/images`,
      // eslint-disable-next-line
      body: formData as any,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ['Content-Type']: `multipart/form-data`
      }
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
      return `Brak pozwolenia na dodanie obrazka do książki.`;

    case 500:
      return `Wewnętrzny błąd serwera.`;

    default:
      return 'Nieznany błąd.';
  }
};
