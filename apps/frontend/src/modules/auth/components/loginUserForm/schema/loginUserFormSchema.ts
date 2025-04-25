import { z } from 'zod';
import { emailSchema, passwordSchema, passwordSuperRefine } from '../../../schemas/authSchemas';

export const loginUserFormSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .superRefine(passwordSuperRefine);

export type LoginUserFormValues = z.infer<typeof loginUserFormSchema>;
