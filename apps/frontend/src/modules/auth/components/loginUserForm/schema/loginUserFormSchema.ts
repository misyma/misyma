import { z } from 'zod';
import { emailSchema, passwordSchema } from '../../../../common/schemas/userSchemas';

export const loginUserFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginUserFormValues = z.infer<typeof loginUserFormSchema>;
