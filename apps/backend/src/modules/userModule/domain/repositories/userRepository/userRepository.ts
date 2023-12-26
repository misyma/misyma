import { type User } from '../../../domain/entities/user/user.js';
import { type UserDomainAction } from '../../entities/user/domainActions/userDomainAction.js';
import { type UserTokens } from '../../entities/userTokens/userTokens.js';

export interface CreateUserPayload {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly isEmailVerified: boolean;
}

export interface CreateUserTokensPayload {
  readonly userId: string;
  readonly refreshToken: string;
}

export interface FindUserPayload {
  readonly id?: string;
  readonly email?: string;
}

export interface FindUserTokensPayload {
  readonly userId: string;
}

export interface UpdateUserPayload {
  readonly id: string;
  readonly domainActions: UserDomainAction[];
}

export interface DeleteUserPayload {
  readonly id: string;
}

export interface UserRepository {
  createUser(input: CreateUserPayload): Promise<User>;
  createUserTokens(input: CreateUserTokensPayload): Promise<UserTokens>;
  findUser(input: FindUserPayload): Promise<User | null>;
  findUserTokens(input: FindUserTokensPayload): Promise<UserTokens | null>;
  updateUser(input: UpdateUserPayload): Promise<User>;
  deleteUser(input: DeleteUserPayload): Promise<void>;
}
