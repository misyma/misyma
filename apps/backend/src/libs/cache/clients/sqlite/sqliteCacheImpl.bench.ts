import { bench, describe } from 'vitest';

import { SqliteCacheImpl } from './sqliteCacheImpl.js';
import { SqliteCacheClientFactory } from '../../factories/sqlite/sqliteCacheClientFactory.js';

interface TestCacheValue {
  key: string;
  firstName: string;
  lastName: string;
}

describe('SqliteCacheImpl', async () => {
  const connection = SqliteCacheClientFactory.create();

  const sqliteCacheImpl = await SqliteCacheImpl.create<TestCacheValue>({
    options: {
      cacheName: 'testing',
      columnNames: ['key', 'firstName', 'lastName'],
    },
    sqliteDatabaseClient: connection,
  });

  await sqliteCacheImpl.set({
    value: {
      firstName: 'Steve',
      key: 'testKey',
      lastName: 'Jobs',
    },
  });

  bench('get', async () => {
    await sqliteCacheImpl.get({
      key: 'testKey',
    });
  });

  bench('set', async () => {
    await sqliteCacheImpl.set({
      value: {
        firstName: 'Steve',
        key: 'testKey',
        lastName: 'Jobs',
      },
    });
  });
});
