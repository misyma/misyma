import { type BookChangeRequest } from './bookChangeRequest.js';

export interface FindBookChangeRequestByIdPathParams {
  readonly id: string;
}

export interface FindAdminBookChangeRequestByIdResponseBody {
  readonly data: BookChangeRequest | undefined;
}
