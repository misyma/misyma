import { type QuoteRawEntity } from '../../../../../databaseModule/infrastructure/tables/quotesTable/quoteRawEntity.js';
import { type QuoteWithJoinsRawEntity } from '../../../../../databaseModule/infrastructure/tables/quotesTable/quoteWithJoinsRawEntity.js';
import { type Quote } from '../../../../domain/entities/quote/quote.js';

export interface QuoteMapper {
  mapToDomain(rawEntity: QuoteRawEntity): Quote;
  mapRawEntityWithJoinsToDomain(rawEntity: QuoteWithJoinsRawEntity): Quote;
}
