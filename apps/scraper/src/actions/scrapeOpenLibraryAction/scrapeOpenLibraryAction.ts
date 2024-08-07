import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

import { type OpenLibraryBook } from './openLibraryBook.js';
import { type OpenLibraryMapper } from './openLibraryMapper.js';
import { type Config } from '../../config.js';
import { type AuthorRepository } from '../../infrastructure/repositories/authorRepository/authorRepository.js';
import { type BookRepository } from '../../infrastructure/repositories/bookRepository/bookRepository.js';
import { type LoggerService } from '../../libs/logger/loggerService.js';

export interface ScrapeOpenLibraryActionPayload {
  readonly from: number | undefined;
}

export class ScrapeOpenLibraryAction {
  public constructor(
    private readonly authorRepository: AuthorRepository,
    private readonly bookRepository: BookRepository,
    private readonly openLibraryMapper: OpenLibraryMapper,
    private readonly config: Config,
    private readonly logger: LoggerService,
  ) {}

  public async execute(payload: ScrapeOpenLibraryActionPayload): Promise<void> {
    const { from } = payload;

    this.logger.info({
      message: 'Scraping Open Library...',
      from,
    });

    const rl = createInterface({
      input: createReadStream(this.config.openLibraryPath),
      crlfDelay: Infinity,
    });

    let lineCount = 0;

    for await (const line of rl) {
      lineCount += 1;

      if (from && lineCount < from) {
        continue;
      }

      await this.processLine(line);

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

    const existingBook = await this.bookRepository.findBook({ title: bookDraft.title });

    if (existingBook) {
      return;
    }

    const authorIds: string[] = [];

    for (const authorName of bookDraft.authorNames) {
      let author = await this.authorRepository.findAuthor({ name: authorName });

      if (!author) {
        author = await this.authorRepository.create({ name: authorName });
      }

      authorIds.push(author.id);
    }

    await this.bookRepository.createBook({
      title: bookDraft.title,
      isbn: bookDraft.isbn,
      publisher: bookDraft.publisher,
      format: bookDraft.format,
      isApproved: true,
      language: bookDraft.language,
      imageUrl: bookDraft.imageUrl,
      releaseYear: bookDraft.releaseYear,
      translator: bookDraft.translator,
      pages: bookDraft.pages,
      authorIds,
    });
  }
}
