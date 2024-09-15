import {
	CreateAuthorRequestBody,
	CreateAuthorResponseBody,
} from '@common/contracts';
import { UseMutationOptions } from '@tanstack/react-query';
import { ApiError } from '../../../../../common/errors/apiError';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';

interface Payload extends CreateAuthorRequestBody {
	accessToken: string | undefined;
}

export const useCreateAuthorMutation = (
	options: UseMutationOptions<CreateAuthorResponseBody, ApiError, Payload>
) => {
	const mapper = new ErrorCodeMessageMapper({
		403: `Brak pozwolenia na stworzenie autora.`,
		409: `Autor już istnieje.`,
	});

	const createAuthor = async (payload: Payload) => {
		const { accessToken, name } = payload;

		const response = await HttpService.post<CreateAuthorResponseBody>({
			url: '/admin/authors',
			body: { name } as unknown as Record<string, unknown>,
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
