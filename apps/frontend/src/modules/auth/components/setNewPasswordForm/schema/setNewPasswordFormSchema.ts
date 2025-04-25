import { z } from 'zod';
import { passwordSchema, passwordSuperRefine } from '../../../schemas/authSchemas';

export const setNewPasswordFormSchema = z
  .object({
    password: passwordSchema,
    repeatedPassword: z.string({
      required_error: 'Wymagane.',
      invalid_type_error: 'Niewłaściwy typ.',
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

export type SetNewPasswordFormSchemaValues = z.infer<typeof setNewPasswordFormSchema>;
