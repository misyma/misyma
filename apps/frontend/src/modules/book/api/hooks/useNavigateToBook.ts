import { useNavigate } from '@tanstack/react-router';

interface UseNavigateToBookProps {
	bookId: string;
}
export const useNavigateToBook = ({ bookId }: UseNavigateToBookProps) => {
	const navigate = useNavigate();

	const navigateToBook = () => {
		navigate({
			to: '/book/tabs/basicDataTab/$bookId',
			params: {
				bookId,
			},
		});
	};

	return {
		navigateToBook,
	};
};
