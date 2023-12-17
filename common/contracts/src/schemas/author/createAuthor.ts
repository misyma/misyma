export interface CreateAuthorBody {
  readonly firstName: string;
  readonly lastName: string;
}

export interface CreateAuthorResponseBody {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
}
