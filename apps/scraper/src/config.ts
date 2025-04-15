import { type Static, Type } from '@sinclair/typebox';
import { TransformDecodeCheckError, Value } from '@sinclair/typebox/value';
import config from 'config';

import { ConfigurationError } from './errors/configurationError.js';
import { logLevels } from './libs/logger/logLevel.js';

const configSchema = Type.Object({
  logLevel: Type.Union(Object.values(logLevels).map((logLevel) => Type.Literal(logLevel))),
  database: Type.Object({
    host: Type.String({ minLength: 1 }),
    port: Type.Number({
      minimum: 1,
      maximum: 65535,
    }),
    username: Type.String({ minLength: 1 }),
    password: Type.String({ minLength: 1 }),
    name: Type.String({ minLength: 1 }),
  }),
});

export type Config = Static<typeof configSchema>;

export function createConfig(): Config {
  try {
    return Value.Decode(configSchema, config);
  } catch (error) {
    if (error instanceof TransformDecodeCheckError) {
      throw new ConfigurationError({ originalError: error });
    }

    throw error;
  }
}
