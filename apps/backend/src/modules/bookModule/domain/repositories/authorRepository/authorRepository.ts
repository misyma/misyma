import { type Author } from '../../../../bookModule/domain/entities/author/author.js';

export interface CreateAuthorPayload {
  readonly firstName: string;
  readonly lastName: string;
}

export interface FindAuthorPayload {
  readonly id?: string;
  readonly firstName?: string;
  readonly lastName?: string;
}

export interface DeleteAuthorPayload {
  readonly id: string;
}

export interface AuthorRepository {
  createAuthor(input: CreateAuthorPayload): Promise<Author>;
  findAuthor(input: FindAuthorPayload): Promise<Author | null>;
  deleteAuthor(input: DeleteAuthorPayload): Promise<void>;
}
