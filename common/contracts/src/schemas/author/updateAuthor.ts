import { type Author } from './author.js';

export interface UpdateAuthorPathParams {
  readonly authorId: string;
}

export interface UpdateAuthorRequestBody {
  readonly name?: string;
  readonly isApproved?: boolean;
}

export type UpdateAuthorResponseBody = Author;
