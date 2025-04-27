import { type DatabaseClient } from './databaseClient.js';

export interface Migration {
  readonly name: string;
  up(databaseClient: DatabaseClient): Promise<void>;
  down(databaseClient: DatabaseClient): Promise<void>;
}
