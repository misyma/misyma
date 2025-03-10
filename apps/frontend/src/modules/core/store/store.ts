import { configureStore } from '@reduxjs/toolkit';

import { adminBookFilterStateSlice } from './states/adminBookFilterState/adminBookFilterStateSlice';
import { bookshelfBooksFilterStateSlice } from './states/bookshelfBooksFilterState/bookshelfBooksFilterStateSlice';
import { myBooksFilterStateSlice } from './states/myBooksFilterState/myBooksFilterStateSlice';
import { preferencesStateSlice } from './states/preferencesState/preferencesStateSlice';
import { quoteFilterStateSlice } from './states/quotesFilterState/quoteFilterStateSlice';
import { userStateSlice } from './states/userState/userStateSlice';

export const store = configureStore({
  reducer: {
    preferences: preferencesStateSlice.reducer,
    user: userStateSlice.reducer,
    myBooksFilter: myBooksFilterStateSlice.reducer,
    quoteFilter: quoteFilterStateSlice.reducer,
    bookshelfBooksFilter: bookshelfBooksFilterStateSlice.reducer,
    adminBookFilter: adminBookFilterStateSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
