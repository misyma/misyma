import { type UserRole } from '@common/contracts';

export interface UserRawEntity {
  readonly id: string;
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly isEmailVerified: boolean;
  readonly role: UserRole;
}
