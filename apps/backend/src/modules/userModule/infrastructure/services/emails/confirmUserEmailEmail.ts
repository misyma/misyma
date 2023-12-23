import { EmailType } from '../../../../../common/types/emailType.js';
import { Email } from '../../../application/services/emailService/email/email.js';
import { type EmailTemplate } from '../../../application/services/emailService/types/emailTemplate.js';

export interface ConfirmUserEmailEmailDraft {
  readonly user: {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
  };
}

export class ConfirmUserEmailEmail extends Email<ConfirmUserEmailEmailDraft> {
  protected template =
    'Hello {{firstName}} {{lastName}}! Please confirm your email by clicking on the link below: {{confirmEmailLink}}';

  protected subject = 'Confirm your email';

  protected emailType = EmailType.confirmEmail;

  public override getRenderedEmailTemplate(confirmEmailLink: string): EmailTemplate {
    const { firstName, lastName, email } = this.user;

    const templateData = {
      firstName,
      lastName,
      email,
      confirmEmailLink,
    };

    const template = this.renderTemplate(this.template, templateData);

    return {
      template,
      subject: this.subject,
    };
  }
}
