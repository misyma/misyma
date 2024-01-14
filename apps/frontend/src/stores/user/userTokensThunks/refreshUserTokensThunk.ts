import { createAsyncThunk } from '@reduxjs/toolkit';
import { RefreshUserTokensBody, RefreshUserTokensResponseBody } from '@common/contracts';

export const refreshUserTokensThunk = createAsyncThunk(
  '/user/refreshTokens',
  async (payload: RefreshUserTokensBody) => {
    const response = await fetch('/api/user/refreshToken', {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) {
      throw new Error('Refresh tokens failed.');
    }

    const data = (await response.json()) as RefreshUserTokensResponseBody;

    return data;
  },
);
