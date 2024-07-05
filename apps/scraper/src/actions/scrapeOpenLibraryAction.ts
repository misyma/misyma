import { type AuthorRepository } from '../db/repositories/authorRepository/authorRepository.js';
import { type BookRepository } from '../db/repositories/bookRepository/bookRepository.js';
import { type LoggerService } from '../libs/logger/loggerService.js';

export class ScrapeOpenLibraryAction {
  public constructor(
    private readonly authorRepository: AuthorRepository,
    private readonly bookRepository: BookRepository,
    private readonly logger: LoggerService,
  ) {}

  public async execute(): Promise<void> {
    this.logger.info({
      message: 'Scraping Open Library...',
      bookRepository: this.bookRepository,
    });

    const dummyAuthor = await this.authorRepository.findAuthor({ name: 'Dummy Author' });

    this.logger.info({
      message: 'Dummy author found.',
      dummyAuthor,
    });

    this.logger.info({
      message: 'Scraping Open Library completed.',
    });
  }
}
