import { type AuthorState, type Author } from '../../../../bookModule/domain/entities/author/author.js';

export interface SaveAuthorPayload {
  readonly author: Author | AuthorState;
}

export interface FindAuthorPayload {
  readonly id?: string;
  readonly name?: string;
}

export interface FindAuthorsPayload {
  readonly ids?: string[];
  readonly name?: string;
  readonly userId?: string;
  readonly bookshelfId?: string;
  readonly isApproved?: boolean;
  readonly page: number;
  readonly pageSize: number;
  readonly sortDate?: 'asc' | 'desc';
}

export interface CountAuthorsPayload {
  readonly ids?: string[];
  readonly name?: string;
  readonly userId?: string;
  readonly bookshelfId?: string;
  readonly isApproved?: boolean;
}

export interface DeleteAuthorPayload {
  readonly id: string;
}

export interface AuthorRepository {
  saveAuthor(input: SaveAuthorPayload): Promise<Author>;
  findAuthor(input: FindAuthorPayload): Promise<Author | null>;
  findAuthors(payload: FindAuthorsPayload): Promise<Author[]>;
  countAuthors(payload: CountAuthorsPayload): Promise<number>;
  deleteAuthor(input: DeleteAuthorPayload): Promise<void>;
}
