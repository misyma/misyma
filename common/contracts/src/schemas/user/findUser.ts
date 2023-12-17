export interface FindUserPathParams {
  readonly id: string;
}

export interface FindUserResponseBody {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
}
