import { readFileSync } from 'fs';

import { Email } from '../../services/emailService/email/email.js';

export interface VerificationEmailTemplateData {
  readonly name: string;
  readonly emailVerificationLink: string;
}

export interface VerificationEmailDraft {
  readonly recipient: string;
  readonly templateData: VerificationEmailTemplateData;
}

export class VerificationEmail extends Email {
  protected subject = 'Confirm your email';

  private bodyTemplateData: VerificationEmailTemplateData;

  public constructor(draft: VerificationEmailDraft) {
    const bodyTemplate = readFileSync('./templates/verificationEmail.html', 'utf-8');

    super(draft.recipient, bodyTemplate);

    this.bodyTemplateData = draft.templateData;
  }

  public getBody(): string {
    return this.renderBody(this.bodyTemplateData as unknown as Record<string, string>);
  }
}
