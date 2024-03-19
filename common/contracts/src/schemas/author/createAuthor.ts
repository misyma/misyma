import { type Author } from './author.js';

export interface CreateAuthorRequestBody {
  readonly firstName: string;
  readonly lastName: string;
}

export interface CreateAuthorResponseBody extends Author {}
