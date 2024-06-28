export enum DatabaseClientType {
  postgres = 'pg',
  sqlite = 'better-sqlite3',
}

interface DatabaseClientConfigBase {
  readonly clientType: DatabaseClientType;
  readonly minPoolConnections: number;
  readonly maxPoolConnections: number;
  readonly isAsyncStackTracesEnabled?: boolean;
  readonly useNullAsDefault?: boolean;
}

export interface DatabaseSqliteClientConfig extends DatabaseClientConfigBase {
  readonly clientType: DatabaseClientType.sqlite;
  readonly filePath: string;
}

export interface DatabasePostgresClientConfig extends DatabaseClientConfigBase {
  readonly clientType: DatabaseClientType.postgres;
  readonly host: string;
  readonly port: number;
  readonly user: string;
  readonly password: string;
  readonly databaseName: string;
}

export type DatabaseClientConfig = DatabaseSqliteClientConfig | DatabasePostgresClientConfig;
