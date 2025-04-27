import { z } from 'zod';
import { emailSchema } from '../../../../common/schemas/userSchemas';

export const sendResetPasswordEmailFormSchema = z.object({
  email: emailSchema,
});

export type SendResetPasswordEmailFormSchemaValues = z.infer<typeof sendResetPasswordEmailFormSchema>;
