/* eslint-disable @typescript-eslint/naming-convention */

import axios, { type AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

import { type Config } from '../../config.js';

export type EIsbnClient = AxiosInstance;

export class EIsbnClientFactory {
  public static create(config: Config): EIsbnClient {
    const httpClient = axios.create({
      baseURL: config.eisbn.baseUrl,
      headers: {
        Accept: 'application/xml',
      },
      timeout: 30000,
    });

    axiosRetry(httpClient, { retries: 3 });

    return httpClient;
  }
}
