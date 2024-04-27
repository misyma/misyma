import { type Author } from './author.js';
import { type Metadata } from '../metadata.js';

export interface FindAuthorsQueryParams {
  readonly name?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindAuthorsResponseBody {
  readonly data: Author[];
  readonly metadata: Metadata;
}
