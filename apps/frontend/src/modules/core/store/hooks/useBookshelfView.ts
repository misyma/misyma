import { useStoreSelector } from './useStoreSelector';
import { setBookshelfView } from '../states/preferencesState/preferencesStateSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { BookshelfView } from '../states/preferencesState/preferencesState';

export const useBookshelfView = () => {
	const dispatch = useDispatch<AppDispatch>();
	const view = useStoreSelector((state) => state.preferences.bookshelfView);

	const updateBookshelfView = (view: BookshelfView) => {
		dispatch(setBookshelfView(view));
	};

	return {
		view,
		updateBookshelfView,
	};
};
