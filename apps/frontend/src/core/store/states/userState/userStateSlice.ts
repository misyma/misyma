import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { User, UserState } from './userState';

const initialState: UserState = {
  currentUser: null,
  refreshToken: null,
  accessToken: null,
};

interface SetCurrentUserActionPayload {
  user: User;
}

interface SetCurrentUserTokensPayload {
  accessToken: string;
  refreshToken: string;
}

export const userStateSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<SetCurrentUserActionPayload>) => {
      state.currentUser = action.payload.user;
    },
    setCurrentUserTokens: (state, action: PayloadAction<SetCurrentUserTokensPayload>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
  },
  selectors: {
    selectCurrentUserTokens: (state) => ({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
    }),
  }
});

export const userStateActions = userStateSlice.actions;

export const userStateSelectors = userStateSlice.selectors;
