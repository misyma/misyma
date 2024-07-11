/* eslint-disable @typescript-eslint/naming-convention */

import axios, { type AxiosInstance } from 'axios';

import { type Config } from '../../config.js';

export class MisymaHttpClientFactory {
  public static create(config: Config): AxiosInstance {
    return axios.create({
      baseURL: config.misyma.url,
      headers: {
        Authorization: `Bearer ${config.misyma.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 5000,
    });
  }
}
