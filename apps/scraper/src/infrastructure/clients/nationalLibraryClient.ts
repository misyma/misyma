/* eslint-disable @typescript-eslint/naming-convention */
import axios, { type AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

export type NationalLibraryClient = AxiosInstance;

export class NationalLibraryClientFactory {
  public static create(): NationalLibraryClient {
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
