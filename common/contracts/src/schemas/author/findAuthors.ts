import { type Author } from './author.js';

export interface FindAuthorsQueryParams {
  readonly name?: string;
}

export interface FindAuthorsResponseBody {
  readonly data: Author[];
}
