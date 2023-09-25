import { type HttpService } from '../../services/httpService/httpService.js';
import { HttpServiceImpl } from '../../services/httpService/httpServiceImpl.js';
import { HttpClientFactory } from '../httpClientFactory/httpClientFactory.js';

export class HttpServiceFactory {
  public static create(): HttpService {
    const httpClient = HttpClientFactory.create();

    return new HttpServiceImpl(httpClient);
  }
}
