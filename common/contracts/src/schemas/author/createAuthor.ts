import { type Author } from './author.js';

export interface CreateAuthorRequestBody {
  readonly name: string;
}

export interface CreateAuthorResponseBody extends Author {}
