import { type SendEmailPayload, type SendGridService } from './sendGridService.js';
import { HttpHeader } from '../../../../common/types/http/httpHeader.js';
import { HttpMediaType } from '../../../../common/types/http/httpMediaType.js';
import { HttpMethodName } from '../../../../common/types/http/httpMethodName.js';
import { type HttpService } from '../../../httpService/services/httpService/httpService.js';
import { type SendGridConfig } from '../../types/sendGridConfig.js';

export class SendGridServiceImpl implements SendGridService {
  public constructor(
    private readonly httpService: HttpService,
    private readonly config: SendGridConfig,
  ) {}

  public async sendEmail(email: SendEmailPayload): Promise<void> {
    const { apiKey, senderEmail } = this.config;

    const url = 'https://api.sendgrid.com/v3/mail/send';

    const requestBody = {
      personalizations: [
        {
          to: [
            {
              email: email.to,
            },
          ],
          subject: email.subject,
        },
      ],
      from: {
        email: senderEmail,
      },
      content: [
        {
          type: HttpMediaType.textXml,
          value: email.body,
        },
      ],
    };

    const requestHeaders = {
      [HttpHeader.authorization]: `Bearer ${apiKey}`,
    };

    await this.httpService.sendRequest({
      method: HttpMethodName.post,
      url,
      body: requestBody,
      headers: requestHeaders,
    });
  }
}
