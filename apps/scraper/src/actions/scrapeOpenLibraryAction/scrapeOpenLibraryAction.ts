import { createReadStream } from 'fs';
import { createInterface } from 'readline';

import { type OpenLibraryBook } from './openLibraryBook.js';
import { type OpenLibraryMapper } from './openLibraryMapper.js';
import { type AuthorRepository } from '../../db/repositories/authorRepository/authorRepository.js';
import { type BookRepository } from '../../db/repositories/bookRepository/bookRepository.js';
import { type LoggerService } from '../../libs/logger/loggerService.js';

const languages = new Set<string>();

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

    // const openLibraryAuthorNames = openLibraryBook.authors;

    // if (!openLibraryAuthorNames || !openLibraryAuthorNames.length) {
    //   this.logger.info({
    //     message: 'Skipping book without authors.',
    //     lineNumber,
    //   });

    //   continue;
    // }

    // const authorNames = openLibraryAuthorNames
    //   .filter((openLibraryAuthorName) => openLibraryAuthorName.length)
    //   .map((openLibraryAuthorName) => this.openLibraryMapper.mapAuthorName(openLibraryAuthorName));

    // const authorIds = [];

    // for (const authorName of authorNames) {
    //   const author = await this.authorRepository.findAuthor({ name: authorName });

    //   if (!author) {
    //     const createdAuthor = await this.authorRepository.create({ name: authorName });

    //     authorIds.push(createdAuthor.id);
    //   } else {
    //     authorIds.push(author.id);
    //   }
    // }

    console.log({ languages });

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

    this.logger.info({
      message: 'Processing book...',
      language: openLibraryBook.language,
    });

    if (openLibraryBook.language) {
      languages.add(openLibraryBook.language);
    }
  }
}
