import { type QuoteRawEntity } from '../../../../../databaseModule/infrastructure/tables/quoteTable/quoteRawEntity.js';
import { type QuoteWithJoinsRawEntity } from '../../../../../databaseModule/infrastructure/tables/quoteTable/quoteWithJoinsRawEntity.js';
import { Quote } from '../../../../domain/entities/quote/quote.js';

import { type QuoteMapper } from './quoteMapper.js';

export class QuoteMapperImpl implements QuoteMapper {
  public mapToDomain({
    id,
    user_book_id: userBookId,
    page,
    content,
    is_favorite: isFavorite,
    created_at: createdAt,
  }: QuoteRawEntity): Quote {
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
    user_book_id: userBookId,
    content,
    is_favorite: isFavorite,
    created_at: createdAt,
    page,
    authors,
    book_title: bookTitle,
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
