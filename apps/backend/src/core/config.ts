import { type Static, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import config from 'config';

import { AwsRegion } from '../common/types/awsRegion.js';
import { LogLevel } from '../libs/logger/types/logLevel.js';

const configSchema = Type.Object({
  server: Type.Object({
    host: Type.String({ minLength: 1 }),
    port: Type.Number({
      minimum: 1,
      maximum: 65535,
    }),
  }),
  admin: Type.Object({
    email: Type.String({ minLength: 1 }),
    password: Type.String({ minLength: 1 }),
  }),
  logLevel: Type.Enum(LogLevel),
  databasePath: Type.String({ minLength: 1 }),
  queueDatabasePath: Type.String({ minLength: 1 }),
  hashSaltRounds: Type.Number({
    minimum: 5,
    maximum: 15,
  }),
  token: Type.Object({
    secret: Type.String({ minLength: 1 }),
    access: Type.Object({
      expiresIn: Type.Number({ minimum: 3600 }),
    }),
    refresh: Type.Object({
      expiresIn: Type.Number({ minimum: 86400 }),
    }),
    emailVerification: Type.Object({
      expiresIn: Type.Number({ minimum: 3600 }),
    }),
    resetPassword: Type.Object({
      expiresIn: Type.Number({ minimum: 1800 }),
    }),
  }),
  sendGrid: Type.Object({
    apiKey: Type.String({ minLength: 1 }),
    senderEmail: Type.String({ minLength: 1 }),
  }),
  frontendUrl: Type.String({ minLength: 1 }),
  aws: Type.Object({
    accessKeyId: Type.String({ minLength: 1 }),
    secretAccessKey: Type.String({ minLength: 1 }),
    region: Type.Enum(AwsRegion),
    bucketName: Type.String({ minLength: 1 }),
    endpoint: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
  }),
});

export type Config = Static<typeof configSchema>;

export class ConfigFactory {
  public static create(): Config {
    return Value.Decode(configSchema, config);
  }
}
