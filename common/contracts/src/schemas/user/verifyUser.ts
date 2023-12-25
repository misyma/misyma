export interface VerifyUserPathParams {
  readonly id: string;
}

export interface VerifyUserQueryParams {
  readonly token: string;
}

export interface VerifyUserResponseBody {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly isEmailVerified: boolean;
}
