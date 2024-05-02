import { beforeEach, expect, describe, it } from 'vitest';

import { AuthorMapperImpl } from './authorMapperImpl.js';
import { AuthorTestFactory } from '../../../../tests/factories/authorTestFactory/authorTestFactory.js';

describe('AuthorMapperImpl', () => {
  let authorMapperImpl: AuthorMapperImpl;

  const authorTestFactory = new AuthorTestFactory();

  beforeEach(async () => {
    authorMapperImpl = new AuthorMapperImpl();
  });

  it('maps from author raw entity to domain author', async () => {
    const authorRawEntity = authorTestFactory.createRaw();

    const author = authorMapperImpl.mapToDomain(authorRawEntity);

    expect(author.getId()).toEqual(authorRawEntity.id);

    expect(author.getState()).toEqual({
      name: authorRawEntity.name,
      isApproved: authorRawEntity.isApproved,
    });
  });
});
