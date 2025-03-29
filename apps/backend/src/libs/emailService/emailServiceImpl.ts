 

import { type EmailType } from '../../common/types/emailType.js';
import { httpHeaders } from '../../common/types/http/httpHeader.js';
import { httpMediaTypes } from '../../common/types/http/httpMediaType.js';
import { httpMethodNames } from '../../common/types/http/httpMethodName.js';
import type { Config } from '../../core/config.ts';
import type { HttpService } from '../httpService/httpService.ts';

import type { EmailService, SendEmailPayload } from './emailService.ts';

const sendGridTemplateIds: Record<EmailType, string> = {
  resetPassword: 'd-c5d3e0729e544bc08892a236b3a63c82',
  verifyEmail: 'd-cfb72497ead24073b841f223bc7d64d6',
};

export class EmailServiceImpl implements EmailService {
  private readonly config: Config;
  private readonly httpService: HttpService;

  public constructor(httpService: HttpService, config: Config) {
    this.httpService = httpService;
    this.config = config;
  }

  public async sendEmail(payload: SendEmailPayload): Promise<void> {
    const { toEmail, template } = payload;

    const url = 'https://api.sendgrid.com/v3/mail/send';

    const requestBody = {
      from: {
        email: this.config.sendGrid.senderEmail,
      },
      personalizations: [
        {
          dynamic_template_data: template.data,
          to: [
            {
              email: toEmail,
            },
          ],
        },
      ],
      template_id: sendGridTemplateIds[template.name],
    };

    const requestHeaders = {
      [httpHeaders.authorization]: `Bearer ${this.config.sendGrid.apiKey}`,
      [httpHeaders.contentType]: httpMediaTypes.applicationJson,
    };

    await this.httpService.sendRequest({
      body: requestBody,
      headers: requestHeaders,
      method: httpMethodNames.post,
      url,
    });
  }
}
