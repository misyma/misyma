import { type Static, Type } from '@sinclair/typebox';

import { BookFormat, Language } from '@common/contracts';

export interface Book {
  readonly id: string;
  readonly title: string;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly releaseYear?: number | undefined;
  readonly language: Language;
  readonly translator?: string | undefined;
  readonly format: BookFormat;
  readonly pages?: number | undefined;
  readonly isApproved: boolean;
  readonly imageUrl?: string | undefined;
  readonly createdAt: Date;
}

export const bookTitleSchema = Type.String({
  minLength: 1,
  maxLength: 256,
});

export const bookIsbnSchema = Type.String({
  pattern: '^(97(8|9))?\\d{9}(\\d|X)$',
});

export const bookPublisherSchema = Type.String({
  minLength: 1,
  maxLength: 128,
});

export const bookReleaseYearSchema = Type.Integer({
  minimum: 1,
  maximum: 2100,
});

export const bookTranslatorSchema = Type.String({
  minLength: 1,
  maxLength: 128,
});

export const bookImageUrlSchema = Type.String({
  minLength: 1,
  maxLength: 128,
});

export const bookPagesSchema = Type.Integer({
  minimum: 1,
  maximum: 10000,
});

export const authorNameSchema = Type.String({
  minLength: 3,
  maxLength: 128,
});

export const bookDraftSchema = Type.Object({
  title: bookTitleSchema,
  isbn: Type.Optional(bookIsbnSchema),
  publisher: Type.Optional(bookPublisherSchema),
  releaseYear: Type.Optional(bookReleaseYearSchema),
  language: Type.Enum(Language),
  translator: Type.Optional(bookTranslatorSchema),
  format: Type.Enum(BookFormat),
  pages: Type.Optional(bookPagesSchema),
  isApproved: Type.Boolean(),
  imageUrl: Type.Optional(bookImageUrlSchema),
  authorNames: Type.Array(authorNameSchema),
});

export type BookDraft = Static<typeof bookDraftSchema>;
