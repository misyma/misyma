import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { BookApiQueryKeys } from '../bookApiQueryKeys.js';
import { findUserBooksBy, FindUserBooksByPayload } from './findUserBooksBy.js';

export const FindUserBooksByQueryOptions = ({
	accessToken,
	...rest
}: FindUserBooksByPayload) =>
	queryOptions({
		queryKey: [
			BookApiQueryKeys.findUserBooksBy,
			rest.isbn,
			rest.bookshelfId,
			rest.page,
			rest.pageSize,
		],
		queryFn: () =>
			findUserBooksBy({
				accessToken,
				...rest,
			}),
		enabled: !!accessToken,
	});

export const FindUserBooksByInfiniteQueryOptions = ({
	accessToken,
	page = 0,
	...rest
}: FindUserBooksByPayload) =>
	infiniteQueryOptions({
		queryKey: [
			BookApiQueryKeys.findUserBooksBy,
			rest.bookshelfId,
			rest.isbn,
			page,
			rest.pageSize,
			'infinite-query',
		],
		initialPageParam: page,
		queryFn: ({ pageParam }) =>
			findUserBooksBy({
				accessToken,
				page: pageParam,
				...rest,
			}),
		getNextPageParam: (lastPage) => {
			if (!lastPage) {
				return undefined;
			}
			if (lastPage.metadata.total === 0) {
				return undefined;
			}
			const totalPages = Math.ceil(
				lastPage.metadata.total / lastPage.metadata.pageSize
			);

			if (lastPage.metadata.page === totalPages) {
				return undefined;
			}

			return lastPage.metadata.page + 1;
		},
		getPreviousPageParam: (lastPage) => {
			if (lastPage.metadata.page > 1) {
				return lastPage.metadata.page - 1;
			}
			return undefined;
		},
		enabled: !!accessToken,
	});
