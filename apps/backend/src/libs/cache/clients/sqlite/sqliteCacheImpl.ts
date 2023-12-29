import { type SqliteDatabaseClient } from '../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type CacheProvider, type CachedValue, type GetPayload, type SetPayload } from '../cacheProvider.js';

interface SqliteCacheImplOptions {
  columnNames: string[];
  cacheName: string;
  // Defaults to 2 minutes, i.e. 120000 milliseconds
  ttl?: number;
}

interface CreatePayload {
  sqliteDatabaseClient: SqliteDatabaseClient;
  options: SqliteCacheImplOptions;
}

export class SqliteCacheImpl<T extends CachedValue> implements CacheProvider<T> {
  private cacheName: string;
  private ttl: number;

  private constructor(
    private readonly sqliteDatabaseClient: SqliteDatabaseClient,
    options: SqliteCacheImplOptions,
  ) {
    this.cacheName = options.cacheName;

    this.ttl = options.ttl ?? 60 * 2 * 1000;
  }

  public static async create<T extends CachedValue>(payload: CreatePayload): Promise<SqliteCacheImpl<T>> {
    const { sqliteDatabaseClient, options } = payload;

    let query = `CREATE TABLE ${options.cacheName} (`;

    if (options.columnNames.length === 0) {
      throw new Error('Column names must be provided!');
    }

    query = query.concat(options.columnNames.join(','), ',ttl', ')');

    await sqliteDatabaseClient.raw(query);

    return new SqliteCacheImpl<T>(sqliteDatabaseClient, options);
  }

  public async get(payload: GetPayload): Promise<T | null> {
    const { key } = payload;

    const rawEntity = await this.sqliteDatabaseClient(this.cacheName).select('*').where({ key }).first();

    if (!rawEntity) {
      return null;
    }

    if (rawEntity['ttl'] <= Date.now()) {
      await this.sqliteDatabaseClient(this.cacheName).delete().where({ key });

      return null;
    }

    return rawEntity as unknown as T;
  }

  public async set(payload: SetPayload<T>): Promise<void> {
    const { value } = payload;

    await this.sqliteDatabaseClient(this.cacheName).insert({
      ...value,
      ttl: new Date().getTime() + this.ttl,
    });
  }

  public async purge(): Promise<void> {
    await this.sqliteDatabaseClient(this.cacheName).truncate();
  }
}
