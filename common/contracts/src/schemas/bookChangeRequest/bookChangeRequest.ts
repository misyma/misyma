import { type Author } from '../author/author.js';
import { type BookFormat } from '../book/bookFormat.js';
import { type Language } from '../book/language.js';

export interface BookChangeRequest {
  readonly id: string;
  readonly bookId: string;
  readonly book: {
    readonly title: string;
    readonly isbn?: string;
    readonly publisher?: string;
    readonly releaseYear?: number;
    readonly language: Language;
    readonly translator?: string;
    readonly format: BookFormat;
    readonly pages?: number;
    readonly isApproved: boolean;
    readonly imageUrl?: string;
    readonly authors: Author[];
    readonly createdAt: string;
  };
  readonly userEmail: string;
  readonly createdAt: string;
  readonly title?: string;
  readonly isbn?: string;
  readonly publisher?: string;
  readonly releaseYear?: number;
  readonly language?: Language;
  readonly translator?: string;
  readonly format?: BookFormat;
  readonly pages?: number;
  readonly imageUrl?: string;
  readonly authorIds?: string[];
}
