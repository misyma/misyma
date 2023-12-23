import { EmailType } from '../../../../../common/types/emailType.js';
import { Email } from '../../../application/services/emailService/email/email.js';
import { type EmailTemplate } from '../../../application/services/emailService/types/emailTemplate.js';

interface User {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
}

export interface ResetPasswordEmailDraft {
  readonly user: User;
  readonly resetPasswordToken: string;
}

export class ResetPasswordEmail extends Email<ResetPasswordEmailDraft> {
  private resetPasswordToken: string;

  protected emailType = EmailType.resetPasswordEmail;

  protected template =
    'Hello {{firstName}} {{lastName}}! Please reset your password by clicking on the link below: {{resetPasswordLink}}';

  protected subject = 'Reset your password';

  public constructor(draft: ResetPasswordEmailDraft) {
    super(draft);

    const { resetPasswordToken } = draft;

    this.resetPasswordToken = resetPasswordToken;
  }

  public getResetPasswordToken(): string {
    return this.resetPasswordToken;
  }

  public getRenderedEmailTemplate(resetPasswordLink: string): EmailTemplate {
    const { firstName, lastName, email } = this.user;

    const templateData = {
      firstName,
      lastName,
      email,
      resetPasswordLink,
    };

    const template = this.renderTemplate(this.template, templateData);

    return {
      template,
      subject: this.subject,
    };
  }
}
