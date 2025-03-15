/* eslint-disable @typescript-eslint/naming-convention */
import axios, { type AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

export type BnClient = AxiosInstance;

export class BnClientFactory {
  public static create(): BnClient {
    const httpClient = axios.create({
      headers: {
        Accept: 'application/json',
      },
      timeout: 10000,
    });

    axiosRetry(httpClient, { retries: 3 });

    return httpClient;
  }
}
