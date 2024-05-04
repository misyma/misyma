import { beforeEach, expect, describe, it } from 'vitest';

import { QuoteMapperImpl } from './quoteMapperImpl.js';
import { QuoteTestFactory } from '../../../../tests/factories/quoteTestFactory/quoteTestFactory.js';

describe('QuoteMapperImpl', () => {
  let quoteMapperImpl: QuoteMapperImpl;

  const quoteTestFactory = new QuoteTestFactory();

  beforeEach(async () => {
    quoteMapperImpl = new QuoteMapperImpl();
  });

  it('maps from quote raw entity to domain quote', async () => {
    const quoteEntity = quoteTestFactory.createRaw();

    const quote = quoteMapperImpl.mapToDomain(quoteEntity);

    expect(quote).toEqual({
      id: quoteEntity.id,
      state: {
        userBookId: quoteEntity.userBookId,
        content: quoteEntity.content,
        isFavorite: quoteEntity.isFavorite,
        createdAt: new Date(quoteEntity.createdAt),
      },
    });
  });
});
