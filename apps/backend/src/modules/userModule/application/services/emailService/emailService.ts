import { type EmailType } from '../../../../../common/types/emailType.js';

export interface SendEmailPayload {
  readonly user: {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
  };
  readonly emailType: EmailType;
}

export interface EmailService {
  sendEmail(payload: SendEmailPayload): Promise<void>;
}
