/* eslint-disable @typescript-eslint/naming-convention */

import axios, { type AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

import { type Config } from '../../config.js';

export class MisymaHttpClientFactory {
  public static create(config: Config): AxiosInstance {
    const httpClient = axios.create({
      baseURL: config.misyma.url,
      headers: {
        Authorization: `Bearer ${config.misyma.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 20000,
    });

    axiosRetry(httpClient, { retries: 3 });

    return httpClient;
  }
}
