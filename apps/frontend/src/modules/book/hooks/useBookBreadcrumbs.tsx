import {
	useBreadcrumbKeysContext,
	useBreadcrumbKeysDispatch,
} from '../../common/contexts/breadcrumbKeysContext';
import { FindUserBookByIdQueryOptions } from '../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../core/store/states/userState/userStateSlice';
import { useFindBookshelfByIdQuery } from '../../bookshelf/api/queries/findBookshelfByIdQuery/findBookshelfByIdQuery';
import { useFindUserQuery } from '../../user/api/queries/findUserQuery/findUserQuery';
import { useEffect } from 'react';
import { useErrorHandledQuery } from '../../common/hooks/useErrorHandledQuery';

interface UseBookBreadcrumbsProps {
	bookId: string;
}
export const useBookBreadcrumbs = ({ bookId }: UseBookBreadcrumbsProps) => {
	const accessToken = useSelector(userStateSelectors.selectAccessToken);
	const dispatch = useBreadcrumbKeysDispatch();
	const breadcrumbKeys = useBreadcrumbKeysContext();
	const { data: userData } = useFindUserQuery();
	const { data: userBookData } = useErrorHandledQuery(
		FindUserBookByIdQueryOptions({
			userBookId: bookId,
			userId: userData?.id ?? '',
			accessToken: accessToken as string,
		})
	);
	const { data: bookshelfResponse } = useFindBookshelfByIdQuery(
		userBookData?.bookshelfId as string
	);

	useEffect(() => {
		if (bookshelfResponse) {
			const updates = [
				{ key: '$bookshelfName', value: bookshelfResponse.name },
				{ key: '$bookshelfId', value: bookshelfResponse.id },
			];

			updates.forEach(({ key, value }) => {
				if (value && breadcrumbKeys[key] !== value) {
					dispatch({ key, value });
				}
			});
		}
	}, [bookshelfResponse, breadcrumbKeys, dispatch]);

	useEffect(() => {
		if (userBookData) {
			const updates = [
				{ key: '$bookName', value: userBookData.book.title },
				{ key: '$bookId', value: bookId },
			];

			updates.forEach(({ key, value }) => {
				if (value && breadcrumbKeys[key] !== value) {
					dispatch({ key, value });
				}
			});
		}
	}, [userBookData, breadcrumbKeys, dispatch, bookId]);
};
