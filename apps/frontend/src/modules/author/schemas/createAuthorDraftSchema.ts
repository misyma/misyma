import { z } from 'zod';

export const createAuthorDraftSchema = z.object({
  name: z
    .string({
      required_error: 'Imię jest wymagane.',
    })
    .min(3, {
      message: 'Imię i nazwisko autora musi miec co najmniej trzy znaki.',
    })
    .max(128, {
      message: 'Imię autora może mieć maksymalnie 128 znaków.',
    }),
});
