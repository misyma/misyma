import { z } from 'zod';

export const loginUserFormSchema = z.object({
  email: z
    .string({
      required_error: 'Wymagane.',
      invalid_type_error: 'Niewłaściwy typ.'
    })
    .email({
      message: 'Niewłaściwy adres email.'
    }),
  password: z
    .string({
      required_error: 'Wymagane.',
      invalid_type_error: 'Niewłaściwy typ.'
    })
    .min(8)
    .max(64),
});

export type LoginUserFormValues = z.infer<typeof loginUserFormSchema>;
