import { Email } from '../../services/emailService/email/email.js';

export interface VerificationEmailTemplateData {
  readonly firstName: string;
  readonly lastName: string;
  readonly emailVerificationLink: string;
}

export interface VerificationEmailDraft {
  readonly recipient: string;
  readonly templateData: VerificationEmailTemplateData;
}

export class VerificationEmail extends Email {
  protected subject = 'Confirm your email';

  protected bodyTemplate =
    'Hello {{name}}! Please confirm your email by clicking on the link below: {{emailVerificationLink}}';

  private bodyTemplateData: VerificationEmailTemplateData;

  public constructor(draft: VerificationEmailDraft) {
    super(draft.recipient);

    this.bodyTemplateData = draft.templateData;
  }

  public getBody(): string {
    return this.renderBody(this.bodyTemplateData as unknown as Record<string, string>);
  }
}
