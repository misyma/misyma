import { type SendGridService } from '../../../../libs/sendGrid/services/sendGridService/sendGridService.js';
import { type EmailService, type SendEmailPayload } from '../../application/services/emailService/emailService.js';

export class EmailServiceImpl implements EmailService {
  // TODO: move to some template config
  private readonly emailTypeToTemplateMapping = {
    confirmEmail: {
      template:
        'Hello {{firstName}} {{lastName}}! Please confirm your email by clicking on the link below: {{confirmEmailLink}}',
      subject: 'Confirm your email',
    },
  };

  public constructor(private readonly sendGridService: SendGridService) {}

  // TODO: add tests
  public sendEmail(payload: SendEmailPayload): Promise<void> {
    const { user, emailType } = payload;

    const template = this.emailTypeToTemplateMapping[emailType];

    if (!template) {
      throw new Error(`Unknown email type: ${emailType}`);
    }

    const { firstName, lastName, email } = user;

    const { subject, template: templateString } = template;

    const confirmEmailLink = 'https://misyma.com/confirm-email';

    const templateData = {
      firstName,
      lastName,
      email,
      confirmEmailLink,
    };

    const emailBody = this.renderTemplate(templateString, templateData);

    return this.sendGridService.sendEmail({
      to: email,
      subject,
      body: emailBody,
    });
  }

  private renderTemplate(template: string, data: Record<string, string>): string {
    let result = template;

    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return result;
  }
}
