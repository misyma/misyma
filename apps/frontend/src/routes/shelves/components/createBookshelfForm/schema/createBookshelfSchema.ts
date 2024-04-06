import { z } from 'zod';

export const createBookshelfSchema = z.object({
  name: z
    .string({
      required_error: 'Niepoprawna nazwa.',
    })
    .min(3, {
      message: 'Nazwa jest zbyt krótka.',
    })
    .max(255, {
      message: 'Nazwa jest zbyt długa.',
    }),
  address: z
    .string({
      required_error: 'Niepoprawny adres.',
    })
    .min(1, {
      message: 'Adres jest zbyt krótki.',
    })
    .max(128, {
      message: 'Adres jest zbyt długi.',
    })
    .optional(),
  imageUrl: z
    .string({
      required_error: 'Niepoprawny adres URL.',
      invalid_type_error: 'Niepoprawny adres URL.',
    })
    .url({
      message: 'Niepoprawny adres URL.',
    })
    .or(z.literal(''))
    .optional(),
});

export type CreateBookshelfFormValues = z.infer<typeof createBookshelfSchema>;
