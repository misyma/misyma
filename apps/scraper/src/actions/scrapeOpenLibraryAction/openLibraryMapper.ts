import { isValidLanguage, type Language } from '../../db/entities/book/language.js';

export class OpenLibraryMapper {
  public mapAuthorName(openLibraryAuthorName: string): string {
    const nameParts = openLibraryAuthorName.split(',');

    if (nameParts.length === 1) {
      return String(nameParts[0]).trim();
    }

    return `${String(nameParts[1]).trimStart()} ${String(nameParts[0])}`;
  }

  public mapLanguage(openLibraryLanguage: string): Language | undefined {
    const abbreviatedLanguage = openLibraryLanguage.toLowerCase().substring(0, 2);

    if (abbreviatedLanguage.length !== 2) {
      return undefined;
    }

    if (isValidLanguage(abbreviatedLanguage)) {
      return abbreviatedLanguage;
    }

    return undefined;
  }
}
