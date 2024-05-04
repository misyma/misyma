import {
  type CreateQuoteCommandHandler,
  type CreateQuotePayload,
  type CreateQuoteResult,
} from './createQuoteCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserBookRepository } from '../../../../bookModule/domain/repositories/userBookRepository/userBookRepository.js';
import { type QuoteRepository } from '../../../domain/repositories/quoteRepository/quoteRepository.js';

export class CreateQuoteCommandHandlerImpl implements CreateQuoteCommandHandler {
  public constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateQuotePayload): Promise<CreateQuoteResult> {
    const { userBookId, content, createdAt, isFavorite } = payload;

    this.loggerService.debug({
      message: 'Creating Quote...',
      userBookId,
      content,
      createdAt,
      isFavorite,
    });

    const existingUserBook = await this.userBookRepository.findUserBook({
      id: userBookId,
    });

    if (!existingUserBook) {
      throw new ResourceNotFoundError({
        resource: 'UserBook',
        id: userBookId,
      });
    }

    const quote = await this.quoteRepository.saveQuote({
      quote: {
        userBookId,
        content,
        createdAt,
        isFavorite,
      },
    });

    this.loggerService.debug({
      message: 'Quote created.',
      id: quote.getId(),
      userBookId,
      content,
      createdAt,
      isFavorite,
    });

    return { quote };
  }
}
