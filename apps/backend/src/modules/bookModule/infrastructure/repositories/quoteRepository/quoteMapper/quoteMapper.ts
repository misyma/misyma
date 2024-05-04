import { type Quote } from '../../../../domain/entities/quote/quote.js';
import { type QuoteRawEntity } from '../../../databases/bookDatabase/tables/quoteTable/quoteRawEntity.js';

export interface QuoteMapper {
  mapToDomain(rawEntity: QuoteRawEntity): Quote;
}
