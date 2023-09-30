import { type User } from '../../../domain/entities/user/user.js';

export interface CreateUserPayload {
  readonly id: string;
  readonly email: string;
  readonly password: string;
}

export interface FindUserPayload {
  readonly id?: string;
  readonly email?: string;
}

export interface UpdateUserPayload {
  readonly id: string;
  readonly password: string;
}

export interface DeleteUserPayload {
  readonly id: string;
}

export interface UserRepository {
  createUser(input: CreateUserPayload): Promise<User>;
  findUser(input: FindUserPayload): Promise<User | null>;
  updateUser(input: UpdateUserPayload): Promise<User>;
  deleteUser(input: DeleteUserPayload): Promise<void>;
}
