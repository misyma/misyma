import {
  type FindQuotesQueryHandlerPayload,
  type FindQuotesQueryHandler,
  type FindQuotesQueryHandlerResult,
} from './findQuotesQueryHandler.js';
import {
  type FindQuotesPayload,
  type QuoteRepository,
} from '../../../domain/repositories/quoteRepository/quoteRepository.js';

export class FindQuotesQueryHandlerImpl implements FindQuotesQueryHandler {
  public constructor(private readonly quoteRepository: QuoteRepository) {}

  public async execute(payload: FindQuotesQueryHandlerPayload): Promise<FindQuotesQueryHandlerResult> {
    const { userId, userBookId, authorId, isFavorite, page, pageSize, sortDate } = payload;

    let findQuotesPayload: FindQuotesPayload = {
      userId,
      page,
      pageSize,
    };

    if (userBookId) {
      findQuotesPayload = {
        ...findQuotesPayload,
        userBookId,
      };
    }

    if (authorId) {
      findQuotesPayload = {
        ...findQuotesPayload,
        authorId,
      };
    }

    if (isFavorite !== undefined) {
      findQuotesPayload = {
        ...findQuotesPayload,
        isFavorite,
      };
    }

    if (sortDate) {
      findQuotesPayload = {
        ...findQuotesPayload,
        sortDate,
      };
    }

    const [quotes, total] = await Promise.all([
      this.quoteRepository.findQuotes(findQuotesPayload),
      this.quoteRepository.countQuotes(findQuotesPayload),
    ]);

    return {
      quotes,
      total,
    };
  }
}
