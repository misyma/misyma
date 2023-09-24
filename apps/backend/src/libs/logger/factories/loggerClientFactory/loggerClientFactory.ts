import { type LoggerClient } from '../../clients/loggerClient/loggerClient.js';

export interface LoggerClientFactory {
  create(): LoggerClient;
}
