import {
  type UpdateQuoteCommandHandler,
  type UpdateQuotePayload,
  type UpdateQuoteResult,
} from './updateQuoteCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type QuoteRepository } from '../../../domain/repositories/quoteRepository/quoteRepository.js';

export class UpdateQuoteCommandHandlerImpl implements UpdateQuoteCommandHandler {
  public constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateQuotePayload): Promise<UpdateQuoteResult> {
    const { id, content, isFavorite } = payload;

    this.loggerService.debug({
      message: 'Updating Quote...',
      id,
      content,
      isFavorite,
    });

    const quote = await this.quoteRepository.findQuote({ id });

    if (!quote) {
      throw new OperationNotValidError({
        reason: 'Quote does not exist.',
        id,
      });
    }

    if (content !== undefined) {
      quote.setContent({ content });
    }

    if (isFavorite !== undefined) {
      quote.setIsFavorite({ isFavorite });
    }

    const updatedQuote = await this.quoteRepository.saveQuote({
      quote,
    });

    this.loggerService.debug({
      message: 'Quote updated.',
      id,
      content,
      isFavorite,
    });

    return { quote: updatedQuote };
  }
}
