import { Generator } from '../../../../../../tests/generator.js';
import { type QuoteState, Quote } from '../../../domain/entities/quote/quote.js';
import { type QuoteRawEntity } from '../../../infrastructure/databases/bookDatabase/tables/quoteTable/quoteRawEntity.js';

export class QuoteTestFactory {
  public create(input: Partial<QuoteState> = {}): Quote {
    return new Quote({
      id: Generator.uuid(),
      userBookId: Generator.uuid(),
      content: Generator.words(),
      createdAt: Generator.pastDate(),
      isFavorite: Generator.boolean(),
      ...input,
    });
  }

  public createRaw(input: Partial<QuoteRawEntity> = {}): QuoteRawEntity {
    return {
      id: Generator.uuid(),
      userBookId: Generator.uuid(),
      content: Generator.words(),
      createdAt: Generator.pastDate(),
      isFavorite: Generator.boolean(),
      ...input,
    };
  }
}
