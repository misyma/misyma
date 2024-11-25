import { configureStore } from '@reduxjs/toolkit';

import { preferencesStateSlice } from './states/preferencesState/preferencesStateSlice';
import { userStateSlice } from './states/userState/userStateSlice';
import { bookshelfStateSlice } from './states/bookshelvesState/bookshelfStateSlice';

export const store = configureStore({
	reducer: {
		preferences: preferencesStateSlice.reducer,
		user: userStateSlice.reducer,
		bookshelves: bookshelfStateSlice.reducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
