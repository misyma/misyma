import { type BookChangeRequest } from './bookChangeRequest.js';

export interface ApplyBookChangeRequestPathParams {
  readonly bookChangeRequestId: string;
}

export interface ApplyBookChangeRequestResponseBody extends BookChangeRequest {}
