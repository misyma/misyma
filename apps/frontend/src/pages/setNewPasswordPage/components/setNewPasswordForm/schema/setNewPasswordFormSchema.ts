import { z } from 'zod';

export const setNewPasswordFormSchema = z
  .object({
    password: z.string().min(8).max(50),
    repeatedPassword: z.string().min(8).max(50),
  })
  .superRefine(({ repeatedPassword, password }, context) => {
    if (repeatedPassword !== password) {
      context.addIssue({
        code: 'custom',
        message: 'The passwords do not match.',
        path: ['repeatedPassword'],
      });
    }
  });

export type SetNewPasswordFormSchemaValues = z.infer<typeof setNewPasswordFormSchema>;
