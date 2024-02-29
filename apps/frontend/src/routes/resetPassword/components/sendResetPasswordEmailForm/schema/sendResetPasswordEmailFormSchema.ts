import { z } from 'zod';

export const sendResetPasswordEmailFormSchema = z.object({
  email: z.string().email(),
});

export type SendResetPasswordEmailFormSchemaValues = z.infer<typeof sendResetPasswordEmailFormSchema>;
