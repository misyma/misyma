import { configureStore } from '@reduxjs/toolkit';

import { preferencesStateSlice } from './preferencesStore/preferencesStateSlice';
import { userStateSlice } from './user/userStore/userStateSlice';
import { userTokensStateSlice } from './user/userTokensSlice/userTokensStateSlice';

export const store = configureStore({
  reducer: {
    preferences: preferencesStateSlice.reducer,
    user: userStateSlice.reducer,
    userTokens: userTokensStateSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
