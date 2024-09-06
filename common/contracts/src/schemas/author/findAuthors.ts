import { type Author } from './author.js';
import { type Metadata } from '../metadata.js';
import { type SortingType } from '../sortingType.js';

export interface FindAuthorsQueryParams {
  readonly name?: string;
  readonly ids?: string[];
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortDate?: SortingType;
}

export interface FindAuthorsResponseBody {
  readonly data: Author[];
  readonly metadata: Metadata;
}
