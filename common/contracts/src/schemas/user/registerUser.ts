export interface RegisterUserBody {
  readonly email: string;
  readonly password: string;
}

export interface RegisterUserResponseBody {
  readonly id: string;
  readonly email: string;
}
