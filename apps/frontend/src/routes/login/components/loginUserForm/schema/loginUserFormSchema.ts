import { z } from 'zod';

export const loginUserFormSchema = z.object({
  email: z
    .string({
      required_error: 'Wymagane.'
    })
    .email(),
  password: z
    .string({
      required_error: 'Wymagane.'
    })
    .min(8)
    .max(50),
});

export type LoginUserFormValues = z.infer<typeof loginUserFormSchema>;
