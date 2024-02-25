import { BaseApiError } from "./types/baseApiError";

type RequestPayload = {
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  url: string;
  /**
   * Defaults to 'application/json'. Determines how the response will be parsed. \\
   * Currently only supports 'application/json' and 'text/plain'.
   */
  accept?: 'application/json' | 'text/plain';
  body?: Record<string, unknown>;
};

type GetRequestPayload = Omit<RequestPayload, 'body'>;

type HttpResponse<T> = BaseHttpResponse<T> | ErrorHttpResponse;

interface ErrorHttpResponse {
  body: BaseApiError;
  success: false;
  statusCode: number;
}

interface BaseHttpResponse<T> {
  body: T;
  success: true;
  statusCode: number;
}

/**
 * I can see a world where we have one instance of it and inject it into the components
 * and queryClient, but I`m unsure how to achieve that. \\
 * This should be fine for the time being.
 */

export class HttpService {
  private static readonly baseUrl = import.meta.env.VITE_API_BASE_URL;

  public static async get<T = unknown>(payload: GetRequestPayload): Promise<HttpResponse<T>> {
    const { url, headers, queryParams, accept = 'application/json' } = payload;

    let requestUrl = `${this.baseUrl}${url}`;

    if (queryParams) {
      const queryString = new URLSearchParams(queryParams).toString();

      requestUrl = `${requestUrl}?${queryString}`;
    }

    const response = await fetch(`${requestUrl}`, {
      headers: {
        ...headers,
        Accept: accept,
      },
      method: 'GET',
    });

    if (!response.ok) {
      return {
        body: await response.json(),
        success: false,
        statusCode: response.status,
      };
    }

    if (accept === 'text/plain') {
      const body = (await response.text()) as T;

      return {
        body,
        success: true,
        statusCode: response.status,
      };
    }

    const body = await response.json();

    return {
      body,
      success: true,
      statusCode: response.status,
    };
  }

  public static async post<T = unknown>(payload: RequestPayload): Promise<HttpResponse<T>> {
    const { url, headers, body, accept = 'application/json' } = payload;

    const response = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        ...headers,
        Accept: accept,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return {
        body: await response.json(),
        success: false,
        statusCode: response.status,
      };
    }

    if (accept === 'application/json') {
      return response.json();
    }

    if (accept === 'text/plain') {
      const body = (await response.text()) as T;

      return {
        body,
        success: true,
        statusCode: response.status,
      };
    }

    const responseBody = await response.json();

    return {
      body: responseBody,
      success: true,
      statusCode: response.status,
    };
  }
}
