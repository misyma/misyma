export interface DatabaseClientConfig {
  readonly minPoolConnections: number;
  readonly maxPoolConnections: number;
  readonly isAsyncStackTracesEnabled?: boolean;
  readonly useNullAsDefault?: boolean;
  readonly host: string;
  readonly port: number;
  readonly user: string;
  readonly password: string;
  readonly databaseName: string;
}
