import { z } from 'zod';
import { emailSchema, passwordSchema, passwordSuperRefine } from '../../../schemas/authSchemas';

export const registerUserFormSchema = z
  .object({
    firstName: z
      .string({
        required_error: 'Wymagane.',
      })
      .min(1, 'Imię musi mieć minimum 1 znak.')
      .max(64, 'Imię może mieć maksymalnie 64 znaki.'),
    email: emailSchema,
    password: passwordSchema,
    repeatedPassword: z.string({
      required_error: 'Wymagane.',
    }),
  })
  .superRefine(({ firstName }, ctx) => {
    const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/g;

    const containsSpecialChars = specialCharacterRegex.test(firstName);

    if (containsSpecialChars) {
      ctx.addIssue({
        code: 'custom',
        path: ['firstName'],
        message: 'Imię nie może zawierać znaków specjalnych',
      });
    }
  })
  .superRefine(({ repeatedPassword, password }, context) => {
    if (repeatedPassword !== password) {
      context.addIssue({
        code: 'custom',
        message: 'Hasła nie są identyczne.',
        path: ['repeatedPassword'],
      });
    }
  })
  .superRefine(passwordSuperRefine);

export type RegisterUserFormSchemaValues = z.infer<typeof registerUserFormSchema>;
