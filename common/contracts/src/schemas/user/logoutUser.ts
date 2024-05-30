export interface LogoutUserPathParams {
  readonly userId: string;
}

export interface LogoutUserRequestBody {
  readonly refreshToken: string;
  readonly accessToken: string;
}
