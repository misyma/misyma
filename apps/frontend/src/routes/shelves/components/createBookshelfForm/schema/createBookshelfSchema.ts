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
  addressId: z
    .string({
      required_error: 'Niepoprawny adres.',
    })
    .uuid({
      message: 'Adres jest niepoprawny.',
    })
    .optional(),
  imageUrl: z
    .string({
      required_error: 'Niepoprawny adres URL.',
    })
    .url({
      message: 'Niepoprawny adres URL.',
    })
    .optional(),
});

export type CreateBookshelfFormValues = z.infer<typeof createBookshelfSchema>;
