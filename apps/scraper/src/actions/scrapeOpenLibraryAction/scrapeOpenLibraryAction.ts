import { createReadStream } from 'fs';
import { createInterface } from 'readline';

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
      authorRepository: this.authorRepository,
      openLibraryMapper: this.openLibraryMapper,
    });

    await this.processFile(this.openLibraryDumpLocation);

    this.logger.info({
      message: 'Scraping Open Library completed.',
    });
  }

  private async processFile(filePath: string): Promise<void> {
    const rl = createInterface({
      input: createReadStream(filePath),
      crlfDelay: Infinity,
    });

    rl.on('line', (line: string) => {
      this.processLine(line); // Process each line
    });

    await new Promise((resolve, reject) => {
      rl.on('close', resolve);

      rl.on('error', reject);
    });

    console.log('File processing completed.');
  }

  private async processLine(line: string): Promise<void> {
    const openLibraryBook = JSON.parse(line.toString()) as OpenLibraryBook;

    const bookDraft = this.openLibraryMapper.mapBook(openLibraryBook);

    if (!bookDraft) {
      return;
    }

    const authorIds = await Promise.all(
      bookDraft.authorNames.map(async (authorName) => {
        const author = await this.authorRepository.findAuthor({ name: authorName });

        if (!author) {
          const createdAuthor = await this.authorRepository.create({ name: authorName });

          return createdAuthor.id;
        }

        return author.id;
      }),
    );

    console.log({
      authors: openLibraryBook.authors,
      authorIds,
    });
  }
}
