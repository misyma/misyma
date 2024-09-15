import {
	CreateBookChangeRequestRequestBody,
	CreateBookshelfResponseBody,
} from '@common/contracts';
import { UseMutationOptions } from '@tanstack/react-query';
import { BookApiError } from '../../../../../book/errors/bookApiError';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { useErrorHandledMutation } from '../../../../../common/hooks/useErrorHandledMutation';

interface Payload extends CreateBookChangeRequestRequestBody {
	accessToken: string;
}

export const useCreateBookChangeRequestMutation = (
	options: UseMutationOptions<
		CreateBookshelfResponseBody,
		BookApiError,
		Payload
	>
) => {
	const createBookChangeRequest = async (payload: Payload) => {
		const { accessToken, ...rest } = payload;

		const response = await HttpService.post<CreateBookshelfResponseBody>(
			{
				url: `/book-change-requests`,
				body: rest as unknown as Record<string, unknown>,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
			{
				filterEmptyStrings: true,
			}
		);

		if (!response.success) {
			throw new BookApiError({
				apiResponseError: response.body.context,
				message: response.body.message,
				statusCode: response.statusCode,
			});
		}

		return response.body;
	};

	return useErrorHandledMutation({
		mutationFn: createBookChangeRequest,
		...options,
	});
};
