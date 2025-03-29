import { stringify } from 'querystring';

import { ExternalServiceError } from '../../common/errors/externalServiceError.js';
import { type HttpStatusCode } from '../../common/types/http/httpStatusCode.js';

import { type HttpService, type SendRequestPayload, type HttpResponse } from './httpService.js';

export class HttpServiceImpl implements HttpService {
  public async sendRequest<ResponseBody>(payload: SendRequestPayload): Promise<HttpResponse<ResponseBody>> {
    const { body, headers, method, queryParams, url } = payload;

    let requestUrl = url;

    if (queryParams && Object.keys(queryParams).length) {
      requestUrl += `?${stringify(queryParams)}`;
    }

    try {
      const response = await fetch(requestUrl, {
        body: body ? JSON.stringify(body) : null,
        headers,
        method,
      });

      if (!response.ok) {
        throw new ExternalServiceError({
          method,
          service: 'HttpService',
          statusCode: response.status,
          url,
        });
      }

      const responseBody = await response.text();

      if (!responseBody.length) {
        return {
          body: {} as ResponseBody,
          statusCode: response.status as HttpStatusCode,
        };
      }

      return {
        body: JSON.parse(responseBody) as ResponseBody,
        statusCode: response.status as HttpStatusCode,
      };
    } catch (error) {
      throw new ExternalServiceError({
        method,
        originalError: error,
        service: 'HttpService',
        url,
      });
    }
  }
}
