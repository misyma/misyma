import { type AxiosInstance } from 'axios';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

import { type OpenLibraryBook } from './openLibraryBook.js';
import { type OpenLibraryMapper } from './openLibraryMapper.js';
import { type Config } from '../../config.js';
import { type LoggerService } from '../../libs/logger/loggerService.js';

export class ScrapeOpenLibraryAction {
  public constructor(
    private readonly misymaHttpClient: AxiosInstance,
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
      const openLibraryBook = JSON.parse(line.toString()) as OpenLibraryBook;

      const bookDraft = this.openLibraryMapper.mapBook(openLibraryBook);

      lineCount += 1;

      if (lineCount % 1000 === 0) {
        this.logger.info({
          message: `Processed ${lineCount} books.`,
        });
      }

      if (!bookDraft) {
        continue;
      }

      await this.misymaHttpClient.post('/api/admin/books/import', bookDraft);
    }

    this.logger.info({ message: 'Scraping Open Library completed.' });
  }
}
