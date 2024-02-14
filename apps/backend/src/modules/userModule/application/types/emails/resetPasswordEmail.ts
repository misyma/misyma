import { readFileSync } from 'fs';

import { Email } from '../../services/emailService/email/email.js';

export interface ResetPasswordEmailTemplateData {
  readonly name: string;
  readonly resetPasswordLink: string;
}

export interface ResetPasswordEmailDraft {
  readonly recipient: string;
  readonly templateData: ResetPasswordEmailTemplateData;
}

export class ResetPasswordEmail extends Email {
  protected subject = 'Reset your password';

  private bodyTemplateData: ResetPasswordEmailTemplateData;

  public constructor(draft: ResetPasswordEmailDraft) {
    const bodyTemplate = readFileSync('./templates/resetPasswordEmail.html', 'utf-8');

    super(draft.recipient, bodyTemplate);

    this.bodyTemplateData = draft.templateData;
  }

  public getBody(): string {
    return this.renderBody(this.bodyTemplateData as unknown as Record<string, string>);
  }
}
