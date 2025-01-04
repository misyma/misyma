import { useDispatch } from 'react-redux';

import { useStoreSelector } from './useStoreSelector';
import { type BookshelfView } from '../states/preferencesState/preferencesState';
import { setBookshelfView } from '../states/preferencesState/preferencesStateSlice';
import { type AppDispatch } from '../store';

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
