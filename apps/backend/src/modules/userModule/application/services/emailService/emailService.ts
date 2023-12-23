import { type ConfirmUserEmailEmail } from '../../../infrastructure/services/emails/confirmUserEmailEmail.js';
import { type ResetPasswordEmail } from '../../../infrastructure/services/emails/resetPasswordEmail.js';

export type Email = ResetPasswordEmail | ConfirmUserEmailEmail;

export interface EmailService {
  sendEmail(emailEntity: Email): Promise<void>;
}
