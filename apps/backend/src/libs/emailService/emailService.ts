import { type emailTypes } from '../../common/types/emailType.js';

export type VerifyEmailEmailTemplate = {
  data: {
    name: string;
    emailVerificationLink: string;
  };
  name: typeof emailTypes.verifyEmail;
};

export type ResetPasswordEmailTemplate = {
  data: {
    resetPasswordLink: string;
  };
  name: typeof emailTypes.resetPassword;
};

export type EmailTemplate = ResetPasswordEmailTemplate | VerifyEmailEmailTemplate;

export interface SendEmailPayload {
  readonly toEmail: string;
  readonly template: EmailTemplate;
}

export interface EmailService {
  sendEmail(payload: SendEmailPayload): Promise<void>;
}
