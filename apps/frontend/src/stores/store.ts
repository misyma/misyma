import { configureStore } from '@reduxjs/toolkit';

import { preferencesStateSlice } from './preferencesStore/preferencesStateSlice';
import { userStateSlice } from './userStore/userStateSlice';

export const store = configureStore({
  reducer: {
    preferences: preferencesStateSlice.reducer,
    user: userStateSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
