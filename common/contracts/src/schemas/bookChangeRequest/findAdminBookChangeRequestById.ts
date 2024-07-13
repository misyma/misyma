import { type BookChangeRequest } from './bookChangeRequest.js';

export interface FindBookChangeRequestByIdPathParams {
  id: string;
}

export interface FindAdminBookChangeRequestByIdResponseBody {
  readonly data: BookChangeRequest | undefined;
}
