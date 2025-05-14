import { Generator } from '../../../../../../tests/generator.js';
import { type QuoteRawEntity } from '../../../../databaseModule/infrastructure/tables/quotesTable/quoteRawEntity.js';
import { type QuoteState, Quote } from '../../../domain/entities/quote/quote.js';

export class QuoteTestFactory {
  public create(input: Partial<QuoteState> = {}): Quote {
    return new Quote({
      id: Generator.uuid(),
      userBookId: Generator.uuid(),
      content: Generator.words(),
      createdAt: Generator.pastDate(),
      isFavorite: Generator.boolean(),
      page: Generator.number(1, 1000).toString(),
      ...input,
    });
  }

  public createRaw(input: Partial<QuoteRawEntity> = {}): QuoteRawEntity {
    return {
      id: Generator.uuid(),
      user_book_id: Generator.uuid(),
      content: Generator.words(),
      created_at: Generator.pastDate(),
      is_favorite: Generator.boolean(),
      page: Generator.number(1, 1000).toString(),
      ...input,
    };
  }
}
