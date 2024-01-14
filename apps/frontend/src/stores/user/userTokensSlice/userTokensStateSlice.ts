import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { UserTokensState } from './userTokensState';
import { loginUserThunk } from '../userTokensThunks/loginUserThunk';
import { refreshUserTokensThunk } from '../userTokensThunks/refreshUserTokensThunk';

const initialState: UserTokensState = {
  tokens: null,
};

interface SetUserTokensActionPayload {
  accessToken: string;
  refreshToken: string;
}

export const userTokensStateSlice = createSlice({
  name: 'userTokens',
  initialState,
  reducers: {
    setUserTokens: (state, action: PayloadAction<SetUserTokensActionPayload>) => {
      state.tokens = {
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    },
    disposeUserTokens: (state) => {
      state.tokens = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.tokens = action.payload;

        return state;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        console.log(action.error);

        return state;
      })
      .addCase(refreshUserTokensThunk.fulfilled, (state, action) => {
        state.tokens = action.payload;

        return state;
      })
      .addCase(refreshUserTokensThunk.rejected, (state, action) => {
        console.log(action.error);

        state.tokens = null;

        return state;
      });
  },
});
