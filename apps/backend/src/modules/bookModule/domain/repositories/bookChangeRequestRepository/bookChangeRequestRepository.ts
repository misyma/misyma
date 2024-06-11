import {
  type BookChangeRequest,
  type BookChangeRequestState,
} from '../../entities/bookChangeRequest/bookChangeRequest.js';

export interface SaveBookChangeRequestPayload {
  readonly bookChangeRequest: BookChangeRequestState;
}

export interface FindBookChangeRequestPayload {
  readonly id: string;
}

export interface FindBookChangeRequestsPayload {
  readonly page: number;
  readonly pageSize: number;
}

export interface DeleteBookChangeRequestPayload {
  readonly id: string;
}

export interface BookChangeRequestRepository {
  saveBookChangeRequest(payload: SaveBookChangeRequestPayload): Promise<BookChangeRequest>;
  findBookChangeRequest(payload: FindBookChangeRequestPayload): Promise<BookChangeRequest | null>;
  findBookChangeRequests(payload: FindBookChangeRequestsPayload): Promise<BookChangeRequest[]>;
  countBookChangeRequests(): Promise<number>;
  deleteBookChangeRequest(payload: DeleteBookChangeRequestPayload): Promise<void>;
}
