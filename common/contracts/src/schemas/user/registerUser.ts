export interface RegisterUserBody {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
}

export interface RegisterUserResponseBody {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
}
