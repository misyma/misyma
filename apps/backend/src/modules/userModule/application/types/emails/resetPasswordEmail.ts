import { Email } from '../../services/emailService/email/email.js';

export interface ResetPasswordEmailTemplateData {
  readonly firstName: string;
  readonly lastName: string;
  readonly resetPasswordLink: string;
}

export interface ResetPasswordEmailDraft {
  readonly recipient: string;
  readonly templateData: ResetPasswordEmailTemplateData;
}

export class ResetPasswordEmail extends Email {
  protected subject = 'Reset your password';

  protected bodyTemplate =
    'Hello {{name}}! Please reset your password by clicking on the link below: {{resetPasswordLink}}';

  private bodyTemplateData: ResetPasswordEmailTemplateData;

  public constructor(draft: ResetPasswordEmailDraft) {
    super(draft.recipient);

    this.bodyTemplateData = draft.templateData;
  }

  public getBody(): string {
    return this.renderBody(this.bodyTemplateData as unknown as Record<string, string>);
  }
}
