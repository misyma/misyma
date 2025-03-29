import { beforeEach, expect, describe, it } from 'vitest';

import { Generator } from '../../../../../../../tests/generator.js';
import { QuoteTestFactory } from '../../../../tests/factories/quoteTestFactory/quoteTestFactory.js';

import { QuoteMapperImpl } from './quoteMapperImpl.js';

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
        createdAt: quoteEntity.createdAt,
        page: quoteEntity.page,
      },
    });
  });

  it('maps from quote raw entity with joins to domain quote', async () => {
    const quoteEntity = quoteTestFactory.createRaw();

    const bookTitle = Generator.title();

    const authors = [Generator.author()];

    const quote = quoteMapperImpl.mapRawEntityWithJoinsToDomain({
      ...quoteEntity,
      bookTitle,
      authors,
    });

    expect(quote).toEqual({
      id: quoteEntity.id,
      state: {
        userBookId: quoteEntity.userBookId,
        content: quoteEntity.content,
        isFavorite: quoteEntity.isFavorite,
        createdAt: quoteEntity.createdAt,
        page: quoteEntity.page,
        authors,
        bookTitle,
      },
    });
  });
});
