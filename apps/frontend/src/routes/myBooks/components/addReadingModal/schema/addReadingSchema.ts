import { z } from 'zod';

export const addReadingSchema = z
  .object({
    startedAt: z.string({
      required_error: 'Wymagane.',
      invalid_type_error: 'Data musi być datą',
    }),
    endedAt: z
      .string({
        invalid_type_error: 'Data musi być datą',
      })
      .optional(),
    rating: z
      .number({
        coerce: true,
        required_error: 'Ocena jest wymagana.',
        invalid_type_error: 'Ocena musi być liczbą.',
      })
      .int()
      .min(0, 'Ocena musi być większa lub równa 0.')
      .max(10, 'Ocena musi być mniejsza lub równa 10.'),
    comment: z
      .string({
        required_error: 'Komentarz jest wymagany.',
      })
      .max(500, 'Komentarz może zawierać maksymalnie 500 znaków.'),
  })
  .superRefine(({ startedAt, endedAt }, context) => {
    const startedAtDate = new Date(startedAt);

    if (!endedAt) {
      return;
    }

    const endedAtDate = new Date(endedAt);

    if (startedAtDate.getTime() > endedAtDate.getTime()) {
      context.addIssue({
        code: 'custom',
        message: 'Data zakończenia czytania nie może być wcześniejsza niż data rozpoczęcia.',
        path: ['endedAt'],
      });
    }

    if (startedAtDate.getTime() > new Date().getTime()) {
      context.addIssue({
        code: 'custom',
        message: 'Data rozpoczęcia czytania nie może być późniejsza niż dzisiejsza data.',
        path: ['startedAt'],
      });
    }

    if (endedAtDate.getTime() > new Date().getTime()) {
      context.addIssue({
        code: 'custom',
        message: 'Data zakończenia czytania nie może być późniejsza niż dzisiejsza data.',
        path: ['endedAt'],
      });
    }
  });

export type AddReadingSchemaValues = z.infer<typeof addReadingSchema>;
