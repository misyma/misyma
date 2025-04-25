import { z } from 'zod';
import { emailSchema } from '../../../schemas/authSchemas';

export const sendResetPasswordEmailFormSchema = z.object({
  email: emailSchema,
});

export type SendResetPasswordEmailFormSchemaValues = z.infer<typeof sendResetPasswordEmailFormSchema>;
