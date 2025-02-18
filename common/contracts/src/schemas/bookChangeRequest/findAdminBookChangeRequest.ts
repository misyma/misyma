import { type BookChangeRequest } from './bookChangeRequest.js';

export interface FindBookChangeRequestPathParams {
  readonly bookChangeRequestId: string;
}

export interface FindAdminBookChangeRequestResponseBody {
  readonly data: BookChangeRequest | undefined;
}
