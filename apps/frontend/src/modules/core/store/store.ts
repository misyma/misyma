import { configureStore } from '@reduxjs/toolkit';

import { preferencesStateSlice } from './states/preferencesState/preferencesStateSlice';
import { userStateSlice } from './states/userState/userStateSlice';
import { bookshelfStateSlice } from './states/bookshelvesState/bookshelfStateSlice';
import { myBooksFilterStateSlice } from './states/myBooksFilterState/myBooksFilterStateSlice';
import { adminBookFilterStateSlice } from './states/adminBookFilterState/adminBookFilterStateSlice';

export const store = configureStore({
	reducer: {
		preferences: preferencesStateSlice.reducer,
		user: userStateSlice.reducer,
		bookshelves: bookshelfStateSlice.reducer,
		myBooksFilter: myBooksFilterStateSlice.reducer,
		adminBookFilter: adminBookFilterStateSlice.reducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
