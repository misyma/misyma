import { type Author } from '../../entities/author/author.js';

export interface CreateAuthorPayload {
  readonly firstName: string;
  readonly lastName: string;
}

export interface FindAuthorPayload {
  readonly id?: string;
  readonly firstName?: string;
  readonly lastName?: string;
}

export interface FindAuthorsByIdsPayload {
  readonly authorIds: string[];
}

export interface DeleteAuthorPayload {
  readonly id: string;
}

export interface AuthorRepository {
  createAuthor(input: CreateAuthorPayload): Promise<Author>;
  findAuthor(input: FindAuthorPayload): Promise<Author | null>;
  findAuthorsByIds(payload: FindAuthorsByIdsPayload): Promise<Author[]>;
  deleteAuthor(input: DeleteAuthorPayload): Promise<void>;
}
