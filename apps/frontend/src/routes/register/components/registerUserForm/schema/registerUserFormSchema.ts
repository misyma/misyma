import { z } from 'zod';

export const registerUserFormSchema = z
  .object({
    firstName: z.string().min(2),
    email: z.string().email(),
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

export type RegisterUserFormSchemaValues = z.infer<typeof registerUserFormSchema>;
