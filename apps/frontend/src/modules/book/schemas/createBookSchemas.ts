import { z } from 'zod';

import { BookFormat, Language } from '@common/contracts';

import { isbnSchema } from '../../common/schemas/isbnSchema';

export const createBookStepOneSchema = z.object({
  isbn: isbnSchema.or(z.literal('')),
  title: z
    .string()
    .min(1, {
      message: 'Tytuł musi mieć co najmniej jeden znak.',
    })
    .max(256, {
      message: 'Tytuł może mieć maksymalnie 256 znaków.',
    }),
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
  publisher: z
    .string()
    .min(1, {
      message: 'Nazwa wydawnictwa powinna mieć co namniej 1 znak.',
    })
    .max(128, {
      message: 'Nazwa wydawnictwa powinna mieć co najwyżej 128 znaków.',
    })
    .or(z.literal('')),
  releaseYear: z
    .number({
      invalid_type_error: 'Rok wydania musi być liczbą.',
      required_error: 'Rok wyadania musi być liczbą.',
      coerce: true,
    })
    .min(1, {
      message: 'Rok wydania musi być wcześniejszy niż 1',
    })
    .max(2100, {
      message: 'Rok wydania nie może być późniejszy niż 2100',
    }),
});

export type CreateBookStepOne = z.infer<typeof createBookStepOneSchema>;

export const createBookStepTwoSchema = z.object({
  language: z.enum(Object.values(Language) as unknown as [string, ...string[]]),
  genreId: z.string().uuid(),
  translator: z
    .string({
      required_error: 'Przekład jest wymagany.',
    })
    .min(1, {
      message: 'Przekład jest zbyt krótki.',
    })
    .max(64, {
      message: 'Przekład może mieć maksymalnie 64 znaki.',
    })
    .or(z.literal('')),
  form: z.nativeEnum(BookFormat).optional(),
  pagesCount: z
    .number({
      required_error: 'Ilość stron jest wymagana.',
      coerce: true,
    })
    .int({
      message: 'Ilość stron musi być wartością całkowitą.',
    })
    .min(1, {
      message: 'Książka nie może mieć mniej niż jedną stronę.',
    })
    .max(5000, {
      message: 'Za dużo stron. Maksymalnie 5000 jest dopuszczalnych.',
    })
    .or(z.literal('')),
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
