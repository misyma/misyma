import { type BookFormat } from './bookFormat.js';
import { type Author } from '../author/author.js';

export interface Book {
  readonly id: string;
  readonly title: string;
  readonly isbn?: string;
  readonly publisher?: string;
  readonly releaseYear?: number;
  readonly language: string;
  readonly translator?: string;
  readonly format: BookFormat;
  readonly pages?: number;
  readonly isApproved: boolean;
  readonly imageUrl?: string;
  readonly authors: Author[];
}
