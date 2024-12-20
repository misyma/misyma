import {
	FindGenresQueryParams,
	FindGenresResponseBody,
} from '@common/contracts';
import { HttpService } from '../../../../core/services/httpService/httpService';

export type GetGenresPayload = FindGenresQueryParams & {
	accessToken: string;
};

export const getGenres = async (payload: GetGenresPayload) => {
	const { accessToken, page, pageSize = 200 } = payload;

	const queryParams: Record<string, string> = {};

	if (page) {
		queryParams.page = `${page}`;
	}

	if (pageSize) {
		queryParams.pageSize = `${pageSize}`;
	}

	const response = await HttpService.get<FindGenresResponseBody>({
		url: '/genres',
		queryParams,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.success) {
		throw new Error();
	}

	return response.body;
};
