import lineByLine from 'n-readlines';

import { type OpenLibraryBook } from './openLibraryBook.js';
import { type OpenLibraryMapper } from './openLibraryMapper.js';
import { type AuthorRepository } from '../../db/repositories/authorRepository/authorRepository.js';
import { type BookRepository } from '../../db/repositories/bookRepository/bookRepository.js';
import { type LoggerService } from '../../libs/logger/loggerService.js';

export class ScrapeOpenLibraryAction {
  private readonly openLibraryDumpLocation = '/home/michal/Desktop/openlib_dump.jsonl';

  public constructor(
    private readonly authorRepository: AuthorRepository,
    private readonly bookRepository: BookRepository,
    private readonly openLibraryMapper: OpenLibraryMapper,
    private readonly logger: LoggerService,
  ) {}

  public async execute(): Promise<void> {
    this.logger.info({
      message: 'Scraping Open Library...',
      bookRepository: this.bookRepository,
    });

    const liner = new lineByLine(this.openLibraryDumpLocation);

    let line;

    let lineNumber = 0;

    while ((line = liner.next())) {
      const openLibraryBook = JSON.parse(line.toString()) as OpenLibraryBook;

      lineNumber++;

      this.logger.info({
        message: 'Processing book...',
        lineNumber,
        openLibraryBook,
      });

      const openLibraryAuthorNames = openLibraryBook.authors;

      if (!openLibraryAuthorNames || !openLibraryAuthorNames.length) {
        this.logger.info({
          message: 'Skipping book without authors.',
          lineNumber,
        });

        continue;
      }

      const authorNames = openLibraryAuthorNames
        .filter((openLibraryAuthorName) => openLibraryAuthorName.length)
        .map((openLibraryAuthorName) => this.openLibraryMapper.mapAuthorName(openLibraryAuthorName));

      const authorIds = [];

      for (const authorName of authorNames) {
        const author = await this.authorRepository.findAuthor({ name: authorName });

        if (!author) {
          const createdAuthor = await this.authorRepository.create({ name: authorName });

          authorIds.push(createdAuthor.id);
        } else {
          authorIds.push(author.id);
        }
      }
    }

    this.logger.info({
      message: 'Scraping Open Library completed.',
    });
  }
}
