import { type SendGridService } from '../../../../libs/sendGrid/services/sendGridService/sendGridService.js';
import { type EmailService, type Email } from '../../application/services/emailService/emailService.js';

export interface EmailServiceConfig {
  readonly confirmEmail: {
    link: string;
  };
  readonly resetPasswordEmail: {
    link: string;
  };
}

export class EmailServiceImpl implements EmailService {
  public constructor(
    private readonly sendGridService: SendGridService,
    private readonly config: EmailServiceConfig,
  ) {}

  // TODO: add tests
  public sendEmail(emailEntity: Email): Promise<void> {
    const { email } = emailEntity.getUser();

    const emailLink = this.config[emailEntity.getType()]?.link;

    const { subject, template } = emailEntity.getRenderedEmailTemplate(emailLink);

    return this.sendGridService.sendEmail({
      to: email,
      subject,
      body: template,
    });
  }
}
