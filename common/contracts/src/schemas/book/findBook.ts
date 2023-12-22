import { type Author } from '../author/author.js';

export interface FindBookPathParams {
  readonly id: string;
}

export interface FindBookResponseBody {
  readonly id: string;
  readonly title: string;
  readonly releaseYear: number;
  readonly authors: Author[];
}
