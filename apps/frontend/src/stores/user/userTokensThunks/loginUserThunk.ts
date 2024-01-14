import { createAsyncThunk } from '@reduxjs/toolkit';
import { LoginUserBody, LoginUserResponseBody } from '@common/contracts';

export const loginUserThunk = createAsyncThunk('/user/login', async (payload: LoginUserBody) => {
  const response = await fetch('/api/user/login', {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json', // TODO: add a common package for headers & types
    },
  });

  if (response.status !== 200) {
    throw new Error('Login failed.');
  }

  const data = (await response.json()) as LoginUserResponseBody;

  return data;
});
