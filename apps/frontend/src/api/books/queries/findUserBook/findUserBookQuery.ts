import { FindUserBookPathParams, FindUserBookResponseBody } from '@common/contracts';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { HttpService } from '../../../../core/services/httpService/httpService';
import { BookApiError } from '../../errors/bookApiError';
import { useQuery } from '@tanstack/react-query';

type Payload = FindUserBookPathParams & {
  userId: string;
};

export const useFindUserBookQuery = ({ userBookId, userId }: Payload) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const findUserBookById = async (payload: Payload): Promise<FindUserBookResponseBody> => {
    const response = await HttpService.get<FindUserBookResponseBody>({
      url: `/users/${payload.userId}/books/${payload.userBookId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.success) {
      throw new BookApiError({
        apiResponseError: response.body.context,
        statusCode: response.statusCode,
        message: mapErrorCodeToErrorMessage(response.statusCode),
      });
    }

    return response.body;
  };

  return useQuery({
    queryKey: ['findUserBookById', userBookId, userId],
    queryFn: () =>
      findUserBookById({
        userBookId,
        userId,
      }),
    enabled: !!accessToken && userId ? true : false,
  });
};

const mapErrorCodeToErrorMessage = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return `Podano błędne dane.`;

    case 403:
      return `Brak pozwolenia na podejrzenie książki.`;

    case 500:
      return `Wewnętrzny błąd serwera.`;

    default:
      return 'Nieznany błąd.';
  }
};
