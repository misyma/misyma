import { type Author } from '../author/author.js';

export interface CreateBookBody {
  readonly title: string;
  readonly releaseYear: number;
  readonly authorIds: string[];
}

export interface CreateBookResponseBody {
  readonly id: string;
  readonly title: string;
  readonly releaseYear: number;
  readonly authors: Author[];
}
