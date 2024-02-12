import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { User, UserState } from './userState';

const initialState: UserState = {
  currentUser: null,
  refreshToken: null,
  accessToken: null,
};

interface SetCurrentUserActionPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const userStateSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<SetCurrentUserActionPayload>) => {
      state.currentUser = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
  },
});

export const userStateActions = userStateSlice.actions;
