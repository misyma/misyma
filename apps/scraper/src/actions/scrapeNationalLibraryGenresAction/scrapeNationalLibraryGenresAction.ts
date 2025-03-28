import { type NationalLibraryResponseBody } from '../../common/nationalLibraryBook.js';
import { type NationalLibraryClient } from '../../infrastructure/clients/nationalLibraryClient.js';
import { type GenreRepository } from '../../infrastructure/repositories/genreRepository/genreRepository.js';
import { type LoggerService } from '../../libs/logger/loggerService.js';

export interface ScrapeNationalLibraryGenresActionPayload {
  readonly from: number | undefined;
}

export class ScrapeNationalLibraryGenresAction {
  public constructor(
    private readonly genreRepository: GenreRepository,
    private readonly bnClient: NationalLibraryClient,
    private readonly logger: LoggerService,
  ) {}

  public async execute(payload: ScrapeNationalLibraryGenresActionPayload): Promise<void> {
    const { from: initialFrom } = payload;

    this.logger.info({
      message: 'Scraping genres from National Library API...',
      from: initialFrom,
    });

    let i = 0;

    let url = 'https://data.bn.org.pl/api/institutions/bibs.json?language=polski&limit=100&formOfWork=Książki';

    if (initialFrom) {
      url += `&sinceId=${initialFrom}`;
    }

    while (url) {
      const response = await this.bnClient.get<NationalLibraryResponseBody>(url);

      const genreNames = response.data.bibs
        .map((book) => book.genre)
        .filter((genre) => genre !== undefined && genre !== '');

      const uniqueGenreNames = [...new Set(genreNames)] as string[];

      await this.genreRepository.createGenres({ names: uniqueGenreNames });

      i += 1;

      this.logger.info({
        message: `Processed ${i * 100} books.`,
        url,
      });

      url = response.data.nextPage;
    }

    this.logger.info({ message: 'Scraping genres from National Library API completed.' });
  }
}
