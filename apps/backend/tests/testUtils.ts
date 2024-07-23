import { type DatabaseClient } from '../src/libs/database/clients/databaseClient/databaseClient.js';

export class TestUtils {
  public constructor(
    protected readonly databaseClient: DatabaseClient,
    protected readonly databaseTable: string,
  ) {}

  public async truncate(): Promise<void> {
    await this.databaseClient.raw(`TRUNCATE TABLE "${this.databaseTable}" CASCADE;`);
  }
}
