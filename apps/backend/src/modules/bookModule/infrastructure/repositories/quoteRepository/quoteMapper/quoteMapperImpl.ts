import { type QuoteRawEntity } from '../../../../../databaseModule/infrastructure/tables/quoteTable/quoteRawEntity.js';
import { type QuoteWithJoinsRawEntity } from '../../../../../databaseModule/infrastructure/tables/quoteTable/quoteWithJoinsRawEntity.js';
import { Quote } from '../../../../domain/entities/quote/quote.js';

import { type QuoteMapper } from './quoteMapper.js';

export class QuoteMapperImpl implements QuoteMapper {
  public mapToDomain({ id, userBookId, content, isFavorite, createdAt, page }: QuoteRawEntity): Quote {
    return new Quote({
      id,
      userBookId,
      content,
      isFavorite,
      createdAt,
      page,
    });
  }

  public mapRawEntityWithJoinsToDomain({
    id,
    userBookId,
    content,
    isFavorite,
    createdAt,
    page,
    authors,
    bookTitle,
  }: QuoteWithJoinsRawEntity): Quote {
    return new Quote({
      id,
      userBookId,
      content,
      isFavorite,
      createdAt,
      page,
      authors,
      bookTitle,
    });
  }
}
