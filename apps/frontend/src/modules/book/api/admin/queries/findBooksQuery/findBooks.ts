import {
	FindAdminBooksQueryParams,
	FindBooksResponseBody,
} from '@common/contracts';
import { HttpService } from '../../../../../core/services/httpService/httpService';

type Payload = FindAdminBooksQueryParams & {
	accessToken: string;
};

export const adminFindBooks = async (values: Payload) => {
	const { title, page, pageSize, accessToken, ...remaining } = values;

	const query: Record<PropertyKey, string> = {};

	if (title) {
		query.title = title;
	}

	if (page) {
		query.page = `${page}`;
	}

	if (pageSize) {
		query.pageSize = `${pageSize}`;
	}

	Object.entries(remaining).forEach(([key, val]) => {
		if (val === undefined || val === '') {
			return;
		}
		if (val === 0) {
			return;
		}
		if (Array.isArray(val)) {
			return (query[key] = val.join(','));
		}
		// eslint-disable-next-line
		if ((val as any) instanceof Date) {
			query[key] = (val as unknown as Date).getFullYear().toString();
			return;
		}

		query[key] = `${val}`;
	});

	const response = await HttpService.get<FindBooksResponseBody>({
		url: '/admin/books',
		queryParams: query,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.success) {
		throw new Error('Error');
	}

	return response.body;
};
