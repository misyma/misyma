import { z } from 'zod';

import { bookFormats } from '@common/contracts';

import { isbnSchema } from '../../common/schemas/isbnSchema';
import { languageSchema, pagesCountSchema, publisherSchema, releaseYearSchema, bookTitleSchema, translatorSchema } from './bookSchemas';

export const createBookStepOneSchema = z.object({
  isbn: isbnSchema.or(z.literal('')),
  title: bookTitleSchema,
  authorIds: z
    .array(
      z
        .string({
          required_error: 'Wymagany',
        })
        .uuid({
          message: 'Brak wybranego autora.',
        }),
    )
    .min(1, {
      message: 'Wymagany jest co najmniej jeden autor.',
    }),
  publisher: publisherSchema.or(z.literal('')),
  releaseYear: releaseYearSchema,
});

export type CreateBookStepOne = z.infer<typeof createBookStepOneSchema>;

export const createBookStepTwoSchema = z.object({
  language: languageSchema,
  categoryId: z.string().uuid(),
  translator: translatorSchema.or(z.literal('')),
  form: z.nativeEnum(bookFormats).optional(),
  pagesCount: pagesCountSchema.or(z.literal('')),
  imageUrl: z
    .string({
      message: 'Niepoprawna wartość.',
    })
    .url({
      message: 'Podana wartość nie jest prawidłowym linkiem.',
    })
    .or(z.literal('')),
});

export type CreateBookStepTwo = z.infer<typeof createBookStepTwoSchema>;
