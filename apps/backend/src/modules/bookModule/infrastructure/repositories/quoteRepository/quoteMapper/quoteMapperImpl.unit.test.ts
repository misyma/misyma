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
        userBookId: quoteEntity.user_book_id,
        content: quoteEntity.content,
        isFavorite: quoteEntity.is_favorite,
        createdAt: quoteEntity.created_at,
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
      book_title: bookTitle,
      authors,
    });

    expect(quote).toEqual({
      id: quoteEntity.id,
      state: {
        userBookId: quoteEntity.user_book_id,
        content: quoteEntity.content,
        isFavorite: quoteEntity.is_favorite,
        createdAt: quoteEntity.created_at,
        page: quoteEntity.page,
        authors,
        bookTitle,
      },
    });
  });
});
