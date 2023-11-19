import { beforeEach, expect, describe, it } from 'vitest';

import { AuthorMapperImpl } from './authorMapperImpl.js';
import { AuthorRawEntityTestFactory } from '../../../../tests/factories/authorRawEntityTestFactory/authorRawEntityTestFactory.js';

describe('AuthorMapperImpl', () => {
  let authorMapperImpl: AuthorMapperImpl;

  const authorEntityTestFactory = new AuthorRawEntityTestFactory();

  beforeEach(async () => {
    authorMapperImpl = new AuthorMapperImpl();
  });

  it('maps from author raw entity to domain author', async () => {
    const authorEntity = authorEntityTestFactory.create();

    const author = authorMapperImpl.mapToDomain(authorEntity);

    expect(author).toEqual({
      id: authorEntity.id,
      firstName: authorEntity.firstName,
      lastName: authorEntity.lastName,
    });
  });
});
