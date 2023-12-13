import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { User, UserState } from './userState';

const initialState: UserState = {
  currentUser: null,
};

interface SetCurrentUserActionPayload {
  user: User;
}

export const userStateSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<SetCurrentUserActionPayload>) => {
      state.currentUser = action.payload.user;
    },
  },
});

export const userStateActions = userStateSlice.actions;
