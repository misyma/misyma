import {
  type FindQuoteByIdPayload,
  type FindQuoteByIdQueryHandler,
  type FindQuoteByIdResult,
} from './findQuoteByIdQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type QuoteRepository } from '../../../domain/repositories/quoteRepository/quoteRepository.js';

export class FindQuoteByIdQueryHandlerImpl implements FindQuoteByIdQueryHandler {
  public constructor(private readonly quoteRepository: QuoteRepository) {}

  public async execute(payload: FindQuoteByIdPayload): Promise<FindQuoteByIdResult> {
    const { id } = payload;

    const quote = await this.quoteRepository.findQuote({ id });

    if (!quote) {
      throw new ResourceNotFoundError({
        resource: 'Quote',
      });
    }

    return { quote };
  }
}
