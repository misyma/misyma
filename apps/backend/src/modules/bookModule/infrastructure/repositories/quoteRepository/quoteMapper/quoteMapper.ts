import { type Quote } from '../../../../domain/entities/quote/quote.js';
import { type QuoteRawEntity } from '../../../databases/bookDatabase/tables/quoteTable/quoteRawEntity.js';
import { type QuoteWithJoinsRawEntity } from '../../../databases/bookDatabase/tables/quoteTable/quoteWithJoinsRawEntity.js';

export interface QuoteMapper {
  mapToDomain(rawEntity: QuoteRawEntity): Quote;
  mapRawEntityWithJoinsToDomain(rawEntity: QuoteWithJoinsRawEntity): Quote;
}
