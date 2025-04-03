/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Language } from '@common/contracts';
import { Value } from '@sinclair/typebox/value';

import { type NationalLibraryBook } from '../../common/nationalLibraryBook.js';
import { bookDraftSchema, type BookDraft } from '../../infrastructure/entities/book/book.js';

export class NationalLibraryBookMapper {
  private readonly genreNamesToIds: Record<string, string>;

  public constructor(genreNamesToIds: Record<string, string>) {
    this.genreNamesToIds = genreNamesToIds;
  }

  public mapBook(nationalLibraryBook: NationalLibraryBook): BookDraft | undefined {
    const marcFields = nationalLibraryBook.marc.fields;

    const getField = (tag: string): any => marcFields.find((f: any) => f[tag]);

    const getSubfield = (tag: string, code: string): any => {
      const field = getField(tag);
      return field ? field[tag].subfields.find((sf: any) => sf[code])?.[code] : undefined;
    };

    const titleRaw = nationalLibraryBook.title;
    const genreRaw = nationalLibraryBook.genre;
    const authorRaw = getSubfield('100', 'a');
    const translatorRaw = getSubfield('700', 'a');
    const publisherRaw = getSubfield('260', 'b');
    const releaseYearRaw = getSubfield('260', 'c');
    const isbn = getSubfield('020', 'a');
    const pagesRaw = getSubfield('300', 'a');

    let pages;
    if (pagesRaw) {
      const pagesMatch = pagesRaw.match(/\d+/);

      if (pagesMatch) {
        pages = parseInt(pagesMatch[0], 10);
      }
    }

    if (!authorRaw || !titleRaw || !pages || !isbn || !genreRaw) {
      return undefined;
    }

    const authorNameParts = authorRaw.split(',');

    let authorName;

    if (authorNameParts.length === 1) {
      authorName = authorNameParts[0].trim();
    } else {
      authorName = authorNameParts[1].trim() + ' ' + authorNameParts[0].trim();
    }

    const title = titleRaw.split(' /')[0]?.trim();

    const genreId = this.getGenreId(genreRaw);

    const bookDraftInput: Partial<BookDraft> = {
      title: title as string,
      isApproved: true,
      language: Language.Polish,
      authorNames: [authorName],
      pages,
      genreId,
    };

    try {
      if (isbn) {
        bookDraftInput.isbn = isbn;
      }

      if (publisherRaw) {
        bookDraftInput.publisher = publisherRaw
          .replace(/"/g, '')
          .replace(/[.,;:!?]+$/, '')
          .trim();
      }

      if (releaseYearRaw) {
        const releaseYearMatch = releaseYearRaw.match(/\d{4}/);

        if (releaseYearMatch) {
          bookDraftInput.releaseYear = parseInt(releaseYearMatch[0], 10);
        }
      }

      if (translatorRaw) {
        const translatorNameParts = translatorRaw.split(',');

        let translatorName;

        if (translatorNameParts.length === 1) {
          translatorName = translatorNameParts[0].trim();
        } else {
          translatorName = translatorNameParts[1].trim() + ' ' + translatorNameParts[0].trim();
        }

        bookDraftInput.translator = translatorName;
      }

      if (!Value.Check(bookDraftSchema, bookDraftInput)) {
        return undefined;
      }

      return bookDraftInput;
    } catch (error) {
      console.error(
        JSON.stringify({
          message: 'Book mapping error.',
          bnBook: nationalLibraryBook,
          error,
        }),
      );

      throw error;
    }
  }

  private getGenreId(rawGenre: string): string {
    const cleaned = rawGenre.toLowerCase();

    for (const [genreName, keywords] of Object.entries(this.genresKeywords)) {
      for (const keyword of keywords) {
        if (cleaned.includes(keyword)) {
          return this.genreNamesToIds[genreName] as string;
        }
      }
    }

    return this.genreNamesToIds['inne'] as string;
  }

  private readonly genresKeywords: Record<string, string[]> = {
    'fantastyka i science fiction': ['fantasy', 'fantastyka', 'science fiction', 'dystopia'],
    'poezja i dramat': [
      'poezja',
      'wiersze',
      'poetycka',
      'poemat',
      'fraszka',
      'liryka',
      'dramat',
      'sztuka teatralna',
      'komedia',
      'tragedia',
      'scenariusz',
      'monodram',
      'pieśń',
      'sonet',
    ],
    'horror i literatura grozy': ['horror', 'groza', 'grozy'],
    'literatura młodzieżowa (young adult)': ['młodzież'],
    'literatura dziecięca': ['dziecięca', 'bajki', 'bajka', 'baśni', 'baśń', 'legendy', 'legenda', 'dzieci'],
    'kryminał i thriller': ['kryminał', 'thriller', 'sensacja', 'kryminalna', 'sensacyjna'],
    'literatura faktu i reportaż': [
      'literatura faktu',
      'reportaż',
      'dokument',
      'sprawozdanie',
      'list',
      'relacja',
      'relacje',
    ],
    'literatura podróżnicza i turystyka': ['podróżnicza', 'podróż', 'ekspedycja', 'turysty', 'przewodnik'],
    'biografia, autobiografia i wspomnienia': [
      'biograf',
      'autobiograf',
      'wspomnienia',
      'pamiętnik',
      'dziennik',
      'wywiad',
    ],
    'powieść historyczna': ['powieść historyczna', 'historyczna', 'wojna'],
    'powieść przygodowa': ['powieść przygodowa', 'przygodow', 'przygoda'],
    'literatura popularnonaukowa': ['popularno'],
    'kuchnia i kulinaria': ['kuchnia', 'kucharsk', 'przepisy', 'poradnik kulinarny', 'dieta', 'ciasta', 'obiady'],
    'poradniki i rozwój osobisty': ['poradnik'],
    'albumy i sztuka (fotografia, malarstwo, architektura)': [
      'album',
      'fotografia',
      'malarstwo',
      'architektura',
      'sztuka',
      'katalog wystawy',
      'grafika',
    ],
    'komiksy i powieści graficzne': ['komiks', 'manga', 'powieść graficzna'],
    'literatura obyczajowa i romans': ['obyczajowa', 'romans', 'miłosna', 'erotyk', 'erotyczn', 'miłość'],
    'duchowość i religia': [
      'religia',
      'religijn',
      'duchowy',
      'duchowość',
      'biblia',
      'sennik',
      'horoskop',
      'katolick',
      'chrześcijańs',
      'modlitwa',
      'biblijne',
      'papieski',
      'kazania',
    ],
    'encyklopedie i słowniki': ['encyklopedia', 'słownik'],
    'publicystyka literacka i eseje': ['esej', 'publicystyka', 'felieton', 'kronika', 'satyra'],
    'informatyka i matematyka': ['informatyka', 'komputer', 'programowanie', 'matematyka', 'statystyka'],
    'nauki przyrodnicze (fizyka, chemia, biologia, astronomia)': [
      'fizyka',
      'chemia',
      'biologia',
      'przyroda',
      'geografia',
    ],
    'nauki społeczne (psychologia, socjologia, polityka)': ['psychologia', 'polityka', 'pedagogika'],
    'nauki humanistyczne (filozofia, historia, językoznawstwo)': [
      'filozofia',
      'historia',
      'językoznawstwo',
      'literaturoznawstwo',
    ],
    'zdrowie i medycyna': ['zdrowie', 'medycyna', 'choroby', 'leczenie', 'terapia'],
    'literatura piękna': ['beletrystyka', 'proza', 'literatura współczesna', 'opowiadanie', 'nowele', 'antologia'],
    powieść: ['powieść'],
  };
}
