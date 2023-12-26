export interface UserRawEntity {
  readonly id: string;
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly isEmailVerified: boolean;
}
