import { stringify } from 'querystring';

import { type HttpResponse, type HttpService, type SendRequestPayload } from './httpService.js';
import { type LoggerService } from '../../../logger/services/loggerService/loggerService.js';
import { type HttpClient } from '../../clients/httpClient/httpClient.js';
import { HttpServiceError } from '../../errors/httpServiceError.js';

export class HttpServiceImpl implements HttpService {
  public constructor(
    private readonly httpClient: HttpClient,
    private readonly loggerService: LoggerService,
  ) {}

  public async sendRequest(payload: SendRequestPayload): Promise<HttpResponse> {
    const { method, url: initialUrl, headers, queryParams, body: requestBody } = payload;

    const body = JSON.stringify(requestBody);

    let url = initialUrl;

    if (queryParams && Object.keys(queryParams).length) {
      url += `?${stringify(queryParams)}`;
    }

    this.loggerService.debug({
      message: 'Sending http request...',
      context: {
        url,
        method,
        body,
        headers,
      },
    });

    try {
      const response = await this.httpClient.fetch({
        url,
        init: {
          method,
          headers: headers as never,
          body,
        },
      });

      // TODO: Fix - throws an error when response body is empty
      const responseBody = await response.json();

      this.loggerService.debug({
        message: 'Http request sent.',
        context: {
          statusCode: response.status,
        },
      });

      return {
        body: responseBody,
        statusCode: response.status,
      };
    } catch (error) {
      const { name, message } =
        error instanceof Error
          ? error
          : {
              name: '',
              message: JSON.stringify(error),
            };

      this.loggerService.error({
        message: 'Http request error.',
        context: {
          error: {
            name,
            message,
          },
        },
      });

      throw new HttpServiceError({
        name,
        message,
      });
    }
  }
}
