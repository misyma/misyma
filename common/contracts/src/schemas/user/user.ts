import { type UserRole } from './userRole.js';

export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly isEmailVerified: boolean;
  readonly role: UserRole;
}
