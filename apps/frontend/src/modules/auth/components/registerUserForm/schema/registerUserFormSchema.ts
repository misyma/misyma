import { z } from 'zod';
import {
  emailSchema,
  nameSchema,
  passwordSchema,
  passwordSuperRefine,
} from '../../../../common/schemas/userSchemas';

export const registerUserFormSchema = z
  .object({
    firstName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    repeatedPassword: z.string({
      required_error: 'Wymagane.',
    }),
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
