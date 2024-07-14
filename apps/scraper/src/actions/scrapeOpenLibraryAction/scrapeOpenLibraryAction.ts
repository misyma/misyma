import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

import { type OpenLibraryBook } from './openLibraryBook.js';
import { type OpenLibraryMapper } from './openLibraryMapper.js';
import { type Config } from '../../config.js';
import { type MisymaService } from '../../infrastructure/services/misymaService.js';
import { type LoggerService } from '../../libs/logger/loggerService.js';

export class ScrapeOpenLibraryAction {
  public constructor(
    private readonly misymaService: MisymaService,
    private readonly openLibraryMapper: OpenLibraryMapper,
    private readonly config: Config,
    private readonly logger: LoggerService,
  ) {}

  public async execute(): Promise<void> {
    this.logger.info({ message: 'Scraping Open Library...' });

    const rl = createInterface({
      input: createReadStream(this.config.openLibraryPath),
      crlfDelay: Infinity,
    });

    let lineCount = 0;

    for await (const line of rl) {
      await this.processLine(line);

      lineCount += 1;

      if (lineCount % 1000 === 0) {
        this.logger.info({
          message: `Processed ${lineCount} books.`,
        });
      }
    }

    this.logger.info({ message: 'Scraping Open Library completed.' });
  }

  private async processLine(line: string): Promise<void> {
    const openLibraryBook = JSON.parse(line.toString()) as OpenLibraryBook;

    const bookDraft = this.openLibraryMapper.mapBook(openLibraryBook);

    if (!bookDraft) {
      return;
    }

    const authorIds: string[] = [];

    for (const authorName of bookDraft.authorNames) {
      let authorId = await this.misymaService.findAuthorId({ name: authorName });

      if (!authorId) {
        const author = await this.misymaService.createAuthor({ name: authorName });

        authorId = author.id;
      }

      authorIds.push(authorId);
    }

    const bookExists = await this.misymaService.bookExists({ title: bookDraft.title });

    if (bookExists) {
      return;
    }

    await this.misymaService.createBook({
      data: {
        title: bookDraft.title,
        isbn: bookDraft.isbn,
        publisher: bookDraft.publisher,
        format: bookDraft.format,
        language: bookDraft.language,
        imageUrl: bookDraft.imageUrl,
        releaseYear: bookDraft.releaseYear,
        translator: bookDraft.translator,
        pages: bookDraft.pages,
        authorIds,
      },
    });
  }
}
