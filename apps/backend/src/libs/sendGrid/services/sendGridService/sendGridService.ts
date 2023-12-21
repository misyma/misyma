export interface SendEmailPayload {
  readonly to: string;
  readonly subject: string;
  readonly body: string;
}

export interface SendGridService {
  sendEmail(email: SendEmailPayload): Promise<void>;
}
