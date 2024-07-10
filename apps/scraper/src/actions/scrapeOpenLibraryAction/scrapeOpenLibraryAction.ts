import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

import { type OpenLibraryBook } from './openLibraryBook.js';
import { type OpenLibraryMapper } from './openLibraryMapper.js';
import { type Config } from '../../config.js';
import { type AuthorRepository } from '../../db/repositories/authorRepository/authorRepository.js';
import { type BookRepository } from '../../db/repositories/bookRepository/bookRepository.js';
import { type LoggerService } from '../../libs/logger/loggerService.js';

export class ScrapeOpenLibraryAction {
  public constructor(
    private readonly authorRepository: AuthorRepository,
    private readonly bookRepository: BookRepository,
    private readonly openLibraryMapper: OpenLibraryMapper,
    private readonly config: Config,
    private readonly logger: LoggerService,
  ) {}

  public async execute(): Promise<void> {
    this.logger.info({
      message: 'Scraping Open Library...',
      bookRepository: this.bookRepository,
      authorRepository: this.authorRepository,
      openLibraryMapper: this.openLibraryMapper,
    });

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

    this.logger.info({
      message: 'Scraping Open Library completed.',
    });
  }

  private async processLine(line: string): Promise<void> {
    const openLibraryBook = JSON.parse(line.toString()) as OpenLibraryBook;

    const bookDraft = this.openLibraryMapper.mapBook(openLibraryBook);

    if (!bookDraft) {
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

    const book = await this.bookRepository.findBook({ title: bookDraft.title });

    if (book) {
      return;
    }

    await this.bookRepository.createBook({
      title: bookDraft.title,
      isbn: bookDraft.isbn,
      publisher: bookDraft.publisher,
      format: bookDraft.format,
      isApproved: bookDraft.isApproved,
      language: bookDraft.language,
      imageUrl: bookDraft.imageUrl,
      releaseYear: bookDraft.releaseYear,
      translator: bookDraft.translator,
      pages: bookDraft.pages,
      authorIds,
    });
  }
}
