import { type DeleteQuoteCommandHandler, type DeleteQuotePayload } from './deleteQuoteCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type QuoteRepository } from '../../../domain/repositories/quoteRepository/quoteRepository.js';

export class DeleteQuoteCommandHandlerImpl implements DeleteQuoteCommandHandler {
  public constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteQuotePayload): Promise<void> {
    const { id } = payload;

    this.loggerService.debug({
      message: 'Deleting Quote...',
      id,
    });

    const quote = await this.quoteRepository.findQuote({ id });

    if (!quote) {
      throw new ResourceNotFoundError({
        resource: 'Quote',
        id,
      });
    }

    await this.quoteRepository.deleteQuote({ id });

    this.loggerService.debug({
      message: 'Quote deleted.',
      id,
    });
  }
}
