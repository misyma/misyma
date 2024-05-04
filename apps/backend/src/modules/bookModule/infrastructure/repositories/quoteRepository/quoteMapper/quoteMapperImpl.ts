import { type QuoteMapper } from './quoteMapper.js';
import { Quote } from '../../../../domain/entities/quote/quote.js';
import { type QuoteRawEntity } from '../../../databases/bookDatabase/tables/quoteTable/quoteRawEntity.js';

export class QuoteMapperImpl implements QuoteMapper {
  public mapToDomain({ id, userBookId, content, isFavorite, createdAt }: QuoteRawEntity): Quote {
    return new Quote({
      id,
      userBookId,
      content,
      isFavorite: Boolean(isFavorite),
      createdAt: new Date(createdAt),
    });
  }
}
