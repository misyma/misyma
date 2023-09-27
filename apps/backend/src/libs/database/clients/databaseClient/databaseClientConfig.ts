import { type DatabaseClientType } from '../../types/databaseClientType.js';

export interface DatabaseClientConfig {
  readonly clientType: DatabaseClientType;
  readonly host: string;
  readonly port: number;
  readonly user: string;
  readonly password: string;
  readonly databaseName: string;
  readonly minPoolConnections: number;
  readonly maxPoolConnections: number;
}
