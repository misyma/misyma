import { type User } from './user.js';

export interface FindUserPathParams {
  readonly userId: string;
}

export interface FindUserResponseBody extends User {}
