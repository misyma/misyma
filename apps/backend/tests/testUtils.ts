import { type DatabaseClient } from '../src/modules/databaseModule/types/databaseClient.js';

export class TestUtils {
  public constructor(
    protected readonly databaseClient: DatabaseClient,
    protected readonly tableName: string,
  ) {}

  public async truncate(): Promise<void> {
    await this.databaseClient.raw(`TRUNCATE TABLE "${this.tableName}" CASCADE;`);
  }
}
