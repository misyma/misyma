import { CreateAuthorRequestBody, CreateAuthorResponseBody } from '@common/contracts';
import { UseMutationOptions } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { ApiError } from '../../../../../common/errors/apiError';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { userStateSelectors } from '../../../../../core/store/states/userState/userStateSlice';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';

export const useCreateAuthorDraftMutation = (
  options: UseMutationOptions<CreateAuthorResponseBody, ApiError, CreateAuthorRequestBody>,
) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const mapper = new ErrorCodeMessageMapper({
    403: `Brak pozwolenia na stworzenie autora.`,
  });

  const createAuthor = async (payload: CreateAuthorRequestBody) => {
    const response = await HttpService.post<CreateAuthorResponseBody>({
      url: '/authors',
      body: payload as unknown as Record<string, unknown>,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.success) {
      throw new ApiError('Author api error.', {
        apiResponseError: response.body.context,
        message: mapper.map(response.statusCode),
        statusCode: response.statusCode,
      });
    }

    return response.body;
  };

  return useErrorHandledMutation({
    mutationFn: createAuthor,
    ...options,
  });
};
