import { type BookFormat } from './bookFormat.js';
import { type Language } from './language.js';

export interface ImportBookRequestBody {
  readonly title: string;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly releaseYear?: number | undefined;
  readonly language: Language;
  readonly translator?: string | undefined;
  readonly format: BookFormat;
  readonly pages?: number | undefined;
  readonly imageUrl?: string | undefined;
  readonly authorNames: string[];
}
