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
});

export type CreateBookshelfFormValues = z.infer<typeof createBookshelfSchema>;
