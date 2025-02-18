import { type QuoteMapper } from './quoteMapper.js';
import { Quote } from '../../../../domain/entities/quote/quote.js';
import { type QuoteRawEntity } from '../../../databases/bookDatabase/tables/quoteTable/quoteRawEntity.js';
import { type QuoteWithJoinsRawEntity } from '../../../databases/bookDatabase/tables/quoteTable/quoteWithJoinsRawEntity.js';

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
