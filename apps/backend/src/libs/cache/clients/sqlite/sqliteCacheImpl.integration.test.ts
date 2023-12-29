import { setTimeout } from 'timers/promises';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { SqliteCacheImpl } from './sqliteCacheImpl.js';
import { type SqliteDatabaseClient } from '../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { SqliteCacheClientFactory } from '../../factories/sqlite/sqliteCacheClientFactory.js';

interface TestCacheValue {
  key: string;
  firstName: string;
  lastName: string;
}

describe('SqliteCacheImpl', () => {
  let sqliteCacheImpl: SqliteCacheImpl<TestCacheValue>;

  let connection: SqliteDatabaseClient;

  beforeEach(async () => {
    connection = SqliteCacheClientFactory.create();

    sqliteCacheImpl = await SqliteCacheImpl.create<TestCacheValue>({
      options: {
        cacheName: 'testing',
        columnNames: ['key', 'firstName', 'lastName'],
        ttl: 100,
      },
      sqliteDatabaseClient: connection,
    });
  });

  afterEach(async () => {
    await connection.raw('DROP TABLE testing');

    await connection.destroy();
  });

  describe('set', () => {
    it('sets cached Value', async () => {
      const key = 'testKey';

      const firstName = 'Steve';

      const lastName = 'Jobs';

      await sqliteCacheImpl.set({
        value: {
          key,
          firstName,
          lastName,
        },
      });

      const cachedValue = await sqliteCacheImpl.get({
        key,
      });

      expect(cachedValue).toEqual({
        key,
        firstName,
        lastName,
        ttl: expect.any(Number),
      });
    });
  });

  describe('get', () => {
    it('returns null - when cached Value was not found', async () => {
      const key = 'nonExistingKey';

      const result = await sqliteCacheImpl.get({
        key,
      });

      expect(result).toBeNull();
    });

    it('returns null - when cached Value has expired', async () => {
      const key = 'testKey';

      const firstName = 'Steve';

      const lastName = 'Jobs';

      await sqliteCacheImpl.set({
        value: {
          key,
          firstName,
          lastName,
        },
      });

      await setTimeout(100);

      const cachedValue = await sqliteCacheImpl.get({
        key,
      });

      expect(cachedValue).toBeNull();
    });

    it('returns cached Value', async () => {
      const key = 'testKey';

      const firstName = 'Steve';

      const lastName = 'Jobs';

      await sqliteCacheImpl.set({
        value: {
          key,
          firstName,
          lastName,
        },
      });

      const cachedValue = await sqliteCacheImpl.get({
        key,
      });

      expect(cachedValue).toEqual({
        key,
        firstName,
        lastName,
        ttl: expect.any(Number),
      });
    });
  });

  describe('purge', () => {
    it('removes all cached Values', async () => {
      const randomValues = Array.from({ length: Generator.number(10, 100) }).map(() => ({
        key: Generator.uuid(),
        firstName: Generator.alphanumericString(20),
        lastName: Generator.alphanumericString(20),
      }));

      for (const randomValue of randomValues) {
        await sqliteCacheImpl.set({
          value: randomValue,
        });
      }

      await sqliteCacheImpl.purge();

      for (const randomValue of randomValues) {
        const cachedValue = await sqliteCacheImpl.get({
          key: randomValue.key,
        });

        expect(cachedValue).toBeNull();
      }
    });
  });
});
