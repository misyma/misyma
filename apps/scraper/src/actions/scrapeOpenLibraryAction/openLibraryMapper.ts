export class OpenLibraryMapper {
  public mapAuthorName(openLibraryAuthorName: string): string {
    const nameParts = openLibraryAuthorName.split(',');

    if (nameParts.length === 1) {
      return String(nameParts[0]).trim();
    }

    return `${String(nameParts[1]).trimStart()} ${String(nameParts[0])}`;
  }
}
