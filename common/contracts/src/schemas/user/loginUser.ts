export interface LoginUserBody {
  readonly email: string;
  readonly password: string;
}

export interface LoginUserResponseBody {
  readonly token: string;
}
