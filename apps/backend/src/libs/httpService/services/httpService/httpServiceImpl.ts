import { stringify } from 'querystring';

import { type HttpResponse, type HttpService, type SendRequestPayload } from './httpService.js';
import { type HttpClient } from '../../clients/httpClient/httpClient.js';
import { HttpServiceError } from '../../errors/httpServiceError.js';

export class HttpServiceImpl implements HttpService {
  public constructor(private readonly httpClient: HttpClient) {}

  public async sendRequest(payload: SendRequestPayload): Promise<HttpResponse> {
    const { method, url: initialUrl, headers, queryParams, body: requestBody } = payload;

    const body = JSON.stringify(requestBody);

    let url = initialUrl;

    if (queryParams && Object.keys(queryParams).length) {
      url += `?${stringify(queryParams)}`;
    }

    console.log({
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

      console.log({
        message: 'Http request sent.',
        context: {
          responseBody,
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

      throw new HttpServiceError({
        name,
        message,
      });
    }
  }
}
