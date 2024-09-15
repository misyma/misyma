import {
	UpdateAuthorPathParams,
	UpdateAuthorRequestBody,
	UpdateAuthorResponseBody,
} from '@common/contracts';
import { UseMutationOptions } from '@tanstack/react-query';
import { ApiError } from '../../../../../common/errors/apiError';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';

interface Payload extends UpdateAuthorPathParams, UpdateAuthorRequestBody {
	accessToken: string | undefined;
}

export const useUpdateAuthorMutation = (
	options: UseMutationOptions<UpdateAuthorResponseBody, ApiError, Payload>
) => {
	const mapper = new ErrorCodeMessageMapper({
		403: `Brak pozwolenia na zmianę danych autora.`,
		409: `Autor o podanym imieniu i nazwisku już istnieje.`,
	});

	const updateAuthor = async (payload: Payload) => {
		const { accessToken, authorId, ...rest } = payload;

		const response = await HttpService.patch<UpdateAuthorResponseBody>({
			url: `/admin/authors/${authorId}`,
			body: rest as unknown as Record<string, unknown>,
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
		mutationFn: updateAuthor,
		...options,
	});
};
