import { type BookChangeRequestFormat } from './bookChangeRequestFormat.js';
import { type Language } from './language.js';
import { type Author } from '../author/author.js';

export interface BookChangeRequest {
  readonly id: string;
  readonly title: string;
  readonly isbn?: string;
  readonly publisher?: string;
  readonly releaseYear?: number;
  readonly language: Language;
  readonly translator?: string;
  readonly format: BookChangeRequestFormat;
  readonly pages?: number;
  readonly isApproved: boolean;
  readonly imageUrl?: string;
  readonly authors: Author[];
}
