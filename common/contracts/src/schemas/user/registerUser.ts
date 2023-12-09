import { type User } from './user.js';

export interface RegisterUserBody {
  readonly email: string;
  readonly password: string;
}

export interface RegisterUserResponseBody {
  readonly user: User;
}
