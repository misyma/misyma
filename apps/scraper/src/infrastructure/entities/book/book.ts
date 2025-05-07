import { type BookFormat, bookFormats, type Language, languages } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

export interface Book {
  readonly id: string;
  readonly title: string;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly release_year?: number | undefined;
  readonly language: Language;
  readonly translator?: string | undefined;
  readonly format?: BookFormat | undefined;
  readonly pages?: number | undefined;
  readonly is_approved: boolean;
  readonly image_url?: string | undefined;
  readonly category_id: string;
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
  release_year: bookReleaseYearSchema,
  language: Type.Union(Object.values(languages).map((language) => Type.Literal(language))),
  translator: Type.Optional(bookTranslatorSchema),
  format: Type.Optional(Type.Union(Object.values(bookFormats).map((bookFormat) => Type.Literal(bookFormat)))),
  pages: bookPagesSchema,
  is_approved: Type.Boolean(),
  image_url: Type.Optional(bookImageUrlSchema),
  author_names: Type.Array(authorNameSchema, { minItems: 1 }),
  category_id: Type.String({ minLength: 1 }),
});

export type BookDraft = Static<typeof bookDraftSchema>;
