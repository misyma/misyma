import { FC, memo, useMemo } from 'react';
import { BookImageMiniature } from '../bookImageMiniature/bookImageMiniature';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { FindUserBookByIdQueryOptions } from '../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery';

interface BookImageLoaderProps {
	bookId: string;
}

const BookImageLoaderComponent: FC<BookImageLoaderProps> = ({ bookId }) => {
	const accessToken = useSelector(userStateSelectors.selectAccessToken);
	const { data: userData, isLoading: isUserLoading } = useFindUserQuery();

	const {
		data: userBookData,
		isLoading: isBookLoading,
		isError,
	} = useErrorHandledQuery(
		FindUserBookByIdQueryOptions({
			userBookId: bookId,
			userId: userData?.id ?? '',
			accessToken: accessToken as string,
		})
	);

	const imageUrl = useMemo(() => {
		return userBookData?.imageUrl || userBookData?.book.imageUrl || '';
	}, [userBookData?.imageUrl, userBookData?.book.imageUrl]);

	if (isUserLoading || isBookLoading) {
		return <div className="w-80 bg-gray-200 animate-pulse rounded-md" />;
	}

	// Show error state
	if (isError) {
		return (
			<div className="w-80 bg-gray-100 flex items-center justify-center rounded-md">
				<span className="text-gray-400">Image not available</span>
			</div>
		);
	}

	return (
		<BookImageMiniature className="object-cover w-80" bookImageSrc={imageUrl} />
	);
};

export const BookImageLoader = memo(BookImageLoaderComponent);
