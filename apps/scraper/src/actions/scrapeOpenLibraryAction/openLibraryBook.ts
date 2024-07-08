/* eslint-disable @typescript-eslint/naming-convention */

export interface OpenLibraryBook {
  readonly image?: string;
  readonly pages?: number;
  readonly title: string;
  readonly isbn13: string;
  readonly authors?: string[];
  readonly binding?: OpenLibraryBookBinding;
  readonly language?: string;
  readonly publisher?: string;
  readonly date_published?: string | number;
}

export type OpenLibraryBookBinding = 'Paperback' | 'Hardcover' | 'Kindle Edition';
