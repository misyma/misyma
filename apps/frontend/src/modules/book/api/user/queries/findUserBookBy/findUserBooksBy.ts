import {
	FindUserBooksQueryParams,
	FindUserBooksResponseBody,
} from '@common/contracts';
import { BookApiError } from '../../../../errors/bookApiError';
import { HttpService } from '../../../../../core/services/httpService/httpService';
import { ErrorCodeMessageMapper } from '../../../../../common/errorCodeMessageMapper/errorCodeMessageMapper';

export interface FindUserBooksByPayload extends FindUserBooksQueryParams {
	accessToken: string;
}

export const findUserBooksBy = async (
	payload: FindUserBooksByPayload
): Promise<FindUserBooksResponseBody> => {
	const mapper = new ErrorCodeMessageMapper({});

	const { accessToken } = payload;

	const queryParams: Record<string, string> = {};

	const { bookshelfId, isbn, page, pageSize } = payload;

	if (bookshelfId) {
		queryParams['bookshelfId'] = bookshelfId;
	}

	if (isbn) {
		queryParams['isbn'] = isbn;
	}

	if (page) {
		queryParams['page'] = `${page}`;
	}

	if (pageSize) {
		queryParams['pageSize'] = `${pageSize}`;
	}

	const response = await HttpService.get<FindUserBooksResponseBody>({
		url: `/user-books`,
		queryParams,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.success) {
		throw new BookApiError({
			apiResponseError: response.body.context,
			statusCode: response.statusCode,
			message: mapper.map(response.statusCode),
		});
	}

	return response.body;
};
