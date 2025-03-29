import { type Metadata } from '../metadata.js';

import { type Genre } from './genre.js';

export interface FindGenresQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindGenresResponseBody {
  readonly data: Genre[];
  readonly metadata: Metadata;
}
